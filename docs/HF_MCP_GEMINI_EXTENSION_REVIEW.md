# Hugging Face MCP and Gemini CLI Extension Review

## Verified provenance

The proposed repository is the public `huggingface/hf-mcp-server` project on GitHub. Its repository page identifies it as the Hugging Face MCP Server and declares an MIT license. The reviewed page showed the `main` branch and a published release history.[1]

## Gemini extension compatibility

Gemini CLI officially supports extension installation from a GitHub repository URL using the command form `gemini extensions install <repository-url>`. Its documentation describes extensions as packages that can include MCP servers, prompts, commands, themes, hooks, subagents, and skills.[2]

## Current environment boundary

The current environment did not report an installed `gemini` executable during the read-only capability check. The extension cannot be installed until a supported Gemini CLI is present and the repository's extension manifest, executable commands, requested tools, and credential requirements have been reviewed. No package, extension, or credentialed connection has been installed or enabled during this review.

## Supported alternative: direct MCP configuration

Gemini CLI's official MCP documentation supports configuring MCP servers separately from extensions, including remote HTTP-based MCP servers and settings-based configuration. The Hugging Face server README documents a public Streamable HTTP endpoint at `https://huggingface.co/mcp`, as well as local `npx` and Docker start commands. This makes direct MCP configuration the documented integration shape; it is distinct from installing a Gemini repository extension.[3] [4]

The reviewed Hugging Face repository tree did not contain `gemini-extension.json`, `extension.json`, or `mcp.json`; it contains a TypeScript MCP server package instead. Therefore, treating its repository URL as a ready-made Gemini extension is not supported by the reviewed repository structure.

## References

[1]: https://github.com/huggingface/hf-mcp-server "Hugging Face MCP Server — GitHub"
[2]: https://geminicli.com/docs/extensions/ "Gemini CLI extensions documentation"
[3]: https://geminicli.com/docs/tools/mcp-server/ "MCP servers with Gemini CLI documentation"
[4]: https://github.com/huggingface/hf-mcp-server#readme "Hugging Face MCP Server README"
