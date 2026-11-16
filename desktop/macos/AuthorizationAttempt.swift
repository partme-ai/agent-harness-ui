import Foundation
import CryptoKit
import Security

func base64url(_ data: Data) -> String {
    data.base64EncodedString().replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "")
}

struct AuthorizationAttempt {
    static let redirect = "ai.partme.harness://oauth/callback"
    enum Result: Equatable { case code(String), denied }
    let state: String
    let verifier: String
    let browserURL: URL
    let deadline = Date().addingTimeInterval(300)

    init(endpoint: URL, clientID: String) throws {
        func nonce() throws -> String {
            var bytes = [UInt8](repeating: 0, count: 32)
            guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else {
                throw URLError(.cannotCreateFile)
            }
            return base64url(Data(bytes))
        }
        state = try nonce()
        verifier = try nonce()
        var url = URLComponents(url: endpoint, resolvingAgainstBaseURL: false)!
        let challenge = base64url(Data(SHA256.hash(data: Data(verifier.utf8))))
        url.queryItems = [
            .init(name: "response_type", value: "code"), .init(name: "client_id", value: clientID),
            .init(name: "redirect_uri", value: Self.redirect), .init(name: "state", value: state),
            .init(name: "code_challenge", value: challenge), .init(name: "code_challenge_method", value: "S256")
        ]
        guard let request = url.url else { throw URLError(.badURL) }
        browserURL = request
    }

    func result(_ url: URL, now: Date = Date()) -> Result? {
        guard now < deadline, let parts = URLComponents(url: url, resolvingAgainstBaseURL: false),
              parts.scheme == "ai.partme.harness", parts.host == "oauth", parts.percentEncodedPath == "/callback",
              parts.user == nil, parts.password == nil, parts.port == nil, parts.fragment == nil,
              let items = parts.queryItems, Set(items.map(\.name)).count == items.count else { return nil }
        func value(_ name: String) -> String? { items.first { $0.name == name }?.value }
        guard value("state") == state else { return nil }
        if value("error") != nil { return value("code") == nil ? .denied : nil }
        guard let code = value("code"), !code.isEmpty else { return nil }
        return .code(code)
    }
}

struct Authority {
    let authorize: URL
    let token: URL
    let client: String

    init?(_ env: [String:String]) {
        func endpoint(_ key: String) -> URL? {
            guard let raw = env[key], let url = URL(string: raw), url.host != nil,
                  url.user == nil, url.password == nil, url.fragment == nil, url.query == nil else { return nil }
            if url.scheme == "https" { return url }
            if env["HARNESS_AUTH_LOCAL_TEST"] == "1", url.scheme == "http", url.host == "127.0.0.1" { return url }
            return nil
        }
        guard let authorize = endpoint("HARNESS_AUTH_AUTHORIZE_URL"), let token = endpoint("HARNESS_AUTH_TOKEN_URL"),
              let client = env["HARNESS_AUTH_CLIENT_ID"], !client.isEmpty else { return nil }
        self.authorize = authorize
        self.token = token
        self.client = client
    }
}

func tokenRequest(_ authority: Authority, attempt: AuthorizationAttempt, code: String) -> URLRequest {
    var req = URLRequest(url: authority.token)
    req.httpMethod = "POST"
    req.timeoutInterval = 25
    req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
    let fields = ["grant_type":"authorization_code", "code":code, "client_id":authority.client,
                  "redirect_uri":AuthorizationAttempt.redirect, "code_verifier":attempt.verifier]
    let safe = CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")
    req.httpBody = Data(fields.map { key,value in key + "=" + value.addingPercentEncoding(withAllowedCharacters: safe)! }.joined(separator:"&").utf8)
    return req
}
