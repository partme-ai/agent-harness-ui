import Foundation
import CryptoKit
@main struct Check {
 static func main() throws {
  let flow = try AuthorizationAttempt(endpoint: URL(string:"https://identity.example/authorize")!, clientID:"harness")
  let query = URLComponents(url:flow.browserURL,resolvingAgainstBaseURL:false)!.queryItems!
  func field(_ name:String)->String { query.first{$0.name == name}!.value! }
  precondition(field("code_challenge_method") == "S256")
  precondition(field("code_challenge") == base64url(Data(SHA256.hash(data:Data(flow.verifier.utf8)))))
  precondition(field("state").count >= 43)
  let callback = AuthorizationAttempt.redirect + "?state=" + field("state") + "&code=example"
  precondition(flow.result(URL(string:callback)!) == .code("example"))
  precondition(flow.result(URL(string:callback.replacingOccurrences(of:"/callback",with:"/other"))!) == nil)
  precondition(flow.result(URL(string:callback+"&code=duplicate")!) == nil)
  precondition(flow.result(URL(string:callback.replacingOccurrences(of:field("state"),with:"old"))!) == nil)
  precondition(flow.result(URL(string:AuthorizationAttempt.redirect+"?state="+field("state")+"&error=access_denied")!) == .denied)
  precondition(flow.result(URL(string:callback)!,now:Date().addingTimeInterval(360)) == nil)
  print("PKCE, redirect and callback checks passed")
 }
}
