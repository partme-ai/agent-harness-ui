import AppKit
import WebKit
import UniformTypeIdentifiers

// Bundle resources have their own origin, independent of a development HTTP server.
final class Assets: NSObject, WKURLSchemeHandler {
    let root = Bundle.main.resourceURL!.appendingPathComponent("ui").standardizedFileURL
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, url.host == "app" else { task.didFailWithError(URLError(.badURL)); return }
        let file = root.appendingPathComponent(url.path).standardizedFileURL
        guard file.path.hasPrefix(root.path + "/"), let data = try? Data(contentsOf: file, options: .mappedIfSafe) else {
            task.didFailWithError(URLError(.fileDoesNotExist)); return
        }
        let mime = file.pathExtension == "js" ? "application/javascript" : UTType(filenameExtension:file.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
        task.didReceive(URLResponse(url:url,mimeType:mime,expectedContentLength:data.count,textEncodingName:nil))
        task.didReceive(data)
        task.didFinish()
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

final class NoRedirect: NSObject, URLSessionTaskDelegate {
    func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse,
                    newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) { completionHandler(nil) }
}

final class Harness: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    let authority = Authority(ProcessInfo.processInfo.environment)
    let network = URLSession(configuration:.ephemeral,delegate:NoRedirect(),delegateQueue:nil)
    var attempt: AuthorizationAttempt?
    var exchange: URLSessionDataTask?
    var timer: Timer?
    var accessToken: String?
    var phase = "idle"
    var window: NSWindow!
    var web: WKWebView!

    func applicationDidFinishLaunching(_ note: Notification) {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(Assets(), forURLScheme:"harness-ui")
        config.userContentController.add(self,name:"harnessAuth")
        web = WKWebView(frame:.zero, configuration:config)
        web.navigationDelegate = self
        window = NSWindow(contentRect:NSRect(x:0,y:0,width:1160,height:800),styleMask:[.titled,.closable,.resizable,.miniaturizable],backing:.buffered,defer:false)
        window.title = "Agent Harness UI"
        window.contentView = web
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps:true)
        web.load(URLRequest(url:URL(string:"harness-ui://app/desktop/index.html")!))
        if CommandLine.arguments.contains("--authorize") { startAuthorization() }
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender:NSApplication)->Bool { true }
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy)->Void) {
        let url = action.request.url
        decisionHandler(url?.scheme == "harness-ui" && url?.host == "app" || url?.absoluteString == "about:blank" ? .allow : .cancel)
    }
    func publish(_ next:String) {
        phase = next
        // Only a fixed status enum reaches JavaScript. Tokens and codes stay in the host.
        web?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('harness-auth-status',{detail:'"+next+"'}))",completionHandler:nil)
    }
    func clear() {
        timer?.invalidate(); timer = nil
        attempt = nil
        exchange?.cancel(); exchange = nil
        accessToken = nil
    }
    func userContentController(_ controller:WKUserContentController,didReceive message:WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.scheme == "harness-ui",
              message.frameInfo.request.url?.host == "app", let command = message.body as? String else { return }
        switch command {
        case "status": publish(authority == nil ? "unconfigured" : phase)
        case "start":
            startAuthorization()
        case "cancel","logout": clear(); publish(authority == nil ? "unconfigured" : "idle")
        default: break
        }
    }
    func startAuthorization() {
        guard let authority else { publish("unconfigured"); return }
        clear()
        do {
            let next = try AuthorizationAttempt(endpoint:authority.authorize,clientID:authority.client)
            attempt = next
            guard NSWorkspace.shared.open(next.browserURL) else { clear(); publish("failed"); return }
            publish("waiting")
            timer = Timer.scheduledTimer(withTimeInterval:300,repeats:false){ [weak self] _ in self?.clear(); self?.publish("expired") }
        } catch { clear(); publish("failed") }
    }
    func application(_ application:NSApplication,open urls:[URL]) {
        guard let authority, let pending = attempt, exchange == nil else { return }
        guard let result = urls.compactMap({pending.result($0)}).first else { return }
        NSApp.activate(ignoringOtherApps:true); window?.makeKeyAndOrderFront(nil)
        guard case let .code(code) = result else { clear(); publish("denied"); return }
        publish("exchanging")
        let task = network.dataTask(with:tokenRequest(authority,attempt:pending,code:code)){ [weak self] data,response,error in
            DispatchQueue.main.async {
                guard let self, self.attempt?.state == pending.state else { return }
                self.clear()
                guard Date() < pending.deadline, error == nil, (response as? HTTPURLResponse)?.statusCode == 200, let data,
                      let payload = (try? JSONSerialization.jsonObject(with:data)) as? [String:Any],
                      let token = payload["access_token"] as? String, !token.isEmpty,
                      (payload["token_type"] as? String)?.lowercased() == "bearer" else { self.publish("failed"); return }
                let lifetime = payload["expires_in"] as? Double
                if let lifetime, lifetime <= 0 { self.publish("expired"); return }
                self.accessToken = token
                self.publish("authorized")
                if let lifetime { self.timer = Timer.scheduledTimer(withTimeInterval:lifetime,repeats:false){ [weak self] _ in self?.clear(); self?.publish("expired") } }
            }
        }
        exchange = task
        task.resume()
    }
}
let app = NSApplication.shared
let host = Harness()
app.setActivationPolicy(.regular)
app.delegate = host
app.run()
