# 桌面浏览器授权

macOS 客户端把工作台打包到应用内。打开应用后，在左下角账户菜单选择 **浏览器授权 → 在浏览器中授权**。确认身份在系统默认浏览器中完成。手机和平板继续使用各自的工作台入口。

## 构建和运行

在 macOS 上安装项目依赖后，使用系统 Swift 编译器构建。

```sh
npm run desktop:macos
open "dist/native/Agent Harness UI.app"
```

未配置身份服务时仍可使用本地工作台。接入支持 OAuth 2.0 Authorization Code + PKCE S256 的授权服务时，注册公开客户端，回调地址须精确填写 `ai.partme.harness://oauth/callback`。客户端无需密钥。

启动前设置以下三个环境变量，完全退出已运行的客户端后再启动。地址使用授权服务提供的 HTTPS 端点。

| 环境变量 | 用途 |
| --- | --- |
| HARNESS_AUTH_AUTHORIZE_URL | 系统浏览器打开的授权端点 |
| HARNESS_AUTH_TOKEN_URL | 客户端换取令牌的端点 |
| HARNESS_AUTH_CLIENT_ID | 已注册的公开客户端 ID |

```sh
open --env "HARNESS_AUTH_AUTHORIZE_URL=$HARNESS_AUTH_AUTHORIZE_URL" \
     --env "HARNESS_AUTH_TOKEN_URL=$HARNESS_AUTH_TOKEN_URL" \
     --env "HARNESS_AUTH_CLIENT_ID=$HARNESS_AUTH_CLIENT_ID" \
     "dist/native/Agent Harness UI.app"
```

在命令末尾添加 `--args --authorize` 可以直接发起授权。仅本机集成测试可设置 `HARNESS_AUTH_LOCAL_TEST=1` 使用 `http://127.0.0.1` 端点。

客户端每次生成新的 state 与 PKCE 校验值。系统协议只负责唤回应用，客户端核对回调后再交换令牌。取消、超时或注销会结束当前授权。令牌仅在当前客户端进程内保存，退出后重新授权。工作台业务功能继续使用现有本地数据。

在 macOS 下可独立运行协议测试。

```sh
swiftc desktop/macos/AuthorizationAttempt.swift desktop/macos/AuthorizationAttemptTests.swift -o /tmp/harness-auth-tests
/tmp/harness-auth-tests
```
