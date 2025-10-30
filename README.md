# SillyTavern-ModelsPresets (WIP)

**Automatically switch presets when the model changes based on intelligent name matching.**

## Overview

The Models Presets extension for SillyTavern automatically applies the appropriate preset whenever you change your AI model. Using fuzzy matching, it analyzes the model name and selects the best-matching preset, streamlining your workflow and ensuring optimal settings for each model.

## Features

- **Automatic Preset Switching**: Instantly applies the right preset when you change models
- **Intelligent Fuzzy Matching**: Uses keyword extraction and fuzzy search to match model names to presets
- **Configurable Sensitivity**: Adjust the match threshold from strict to lenient
- **Fallback Support**: Specify a default preset when no match is found
- **Mapping History**: Track which presets were applied to which models

## Installation

1. Navigate to your SillyTavern installation directory
2. Go to `public/scripts/extensions/`
3. Clone or copy this extension into the directory
4. Restart SillyTavern or refresh the page
5. The extension will automatically load

### How It Works

1. **Model Change Detection**: When you switch to a different AI model, the extension activates
2. **Keyword Extraction**: The extension extracts meaningful keywords from the model name
   - Example: `claude-sonnet-4-5` → extracts `["claude", "sonnet"]`
   - Filters out numbers and short words for better matching
3. **Fuzzy Matching**: Each keyword is searched against your available presets using Fuse.js
4. **Preset Application**: If a match is found above the sensitivity threshold, that preset is applied
5. **Fallback**: If no match is found, the configured fallback preset is used

### Examples

| Model Name | Extracted Keywords | Matched Preset |
|-----------|-------------------|----------------|
| `claude-sonnet-4-5` | `["claude", "sonnet"]` | "Claude" or "Sonnet" |
| `gpt-4-turbo` | `["gpt", "turbo"]` | "GPT-4" or "Turbo" |
| `llama-3-70b-instruct` | `["llama", "instruct"]` | "Llama" or "Instruct" |
| `mistral-medium-latest` | `["mistral", "medium", "latest"]` | "Mistral" |

## Configuration Options

### Enable/Disable Extension
Toggle the extension on or off without unloading it.

## License

AGPL 3.0
