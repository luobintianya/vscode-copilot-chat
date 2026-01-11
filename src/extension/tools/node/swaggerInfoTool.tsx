/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as toml from '@iarna/toml';
import type * as vscode from 'vscode';
import * as yaml from 'yaml';
import { IPromptPathRepresentationService } from '../../../platform/prompts/common/promptPathRepresentationService';
import { IWorkspaceService } from '../../../platform/workspace/common/workspaceService';
import { LanguageModelTextPart, LanguageModelToolResult } from '../../../vscodeTypes';
import { ToolName } from '../common/toolNames';
import { ToolRegistry } from '../common/toolsRegistry';
import { checkCancellation } from './toolUtils';

interface ISwaggerInfoTool {
	readonly filePaths?: string[];
	readonly urls?: string[];
}

class SwaggerInfoTool implements vscode.LanguageModelTool<ISwaggerInfoTool> {

	static readonly toolName = ToolName.SwaggerInfo;

	constructor(
		@IWorkspaceService private readonly workspaceService: IWorkspaceService,
		@IPromptPathRepresentationService private readonly _promptPathRepresentationService: IPromptPathRepresentationService,
	) { }

	async invoke(options: vscode.LanguageModelToolInvocationOptions<ISwaggerInfoTool>, token: vscode.CancellationToken) {
		const summaries: string[] = [];
		const inputs: { source: string; getter: () => Promise<string> }[] = [];

		if (options.input.filePaths) {
			for (const filePath of options.input.filePaths) {
				inputs.push({
					source: filePath,
					getter: async () => {
						const uri = this._promptPathRepresentationService.resolveFilePath(filePath);
						if (!uri) {
							throw new Error(`Could not resolve path: ${filePath}`);
						}
						const doc = await this.workspaceService.openTextDocumentAndSnapshot(uri);
						return doc.getText();
					}
				});
			}
		}

		if (options.input.urls) {
			for (const url of options.input.urls) {
				inputs.push({
					source: url,
					getter: async () => {
						const res = await fetch(url);
						if (!res.ok) {
							throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
						}
						return res.text();
					}
				});
			}
		}

		for (const { source, getter } of inputs) {
			try {
				const content = await getter();
				let parsed: any;
				try {
					parsed = JSON.parse(content);
				} catch {
					try {
						parsed = yaml.parse(content);
					} catch (e) {
						parsed = null;
					}
				}

				if (parsed) {
					let tomlString = '';
					try {
						tomlString = toml.stringify(parsed);
					} catch (e) {
						tomlString = `Error converting to TOML: ${e}`;
					}

					const info = parsed.info || {};
					const paths = parsed.paths || {};
					const summary = `API Title: ${info.title || 'Unknown'}\nDescription: ${info.description || 'No description'}\nVersion: ${info.version || 'Unknown'}\nEndpoints: ${Object.keys(paths).length}`;
					summaries.push(`Source: ${source}\n${summary}\nTOML Content:\n${tomlString}`);
				} else {
					summaries.push(`Failed to parse ${source}: Invalid JSON or YAML.`);
				}
			} catch (err) {
				summaries.push(`Failed to process ${source}: ${err}`);
			}
		}

		checkCancellation(token);
		return new LanguageModelToolResult([
			new LanguageModelTextPart(summaries.join('\n\n'))
		]);
	}

	async prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<ISwaggerInfoTool>, token: vscode.CancellationToken): Promise<vscode.PreparedToolInvocation> {
		return {
			presentation: 'hidden',
		};
	}
}

ToolRegistry.registerTool(SwaggerInfoTool);
