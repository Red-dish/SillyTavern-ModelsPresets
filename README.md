# SillyTavern-ModelsPresets

**Automatically switch presets when the model changes based on intelligent name matching.**

## Overview

The Models Presets extension for SillyTavern automatically applies the appropriate preset whenever you change your AI model. Using fuzzy matching, it analyzes the model name and selects the best-matching preset, streamlining your workflow and ensuring optimal settings for each model.

## Features

- **🎯 Automatic Preset Switching**: Instantly applies the right preset when you change models
- **🔍 Intelligent Fuzzy Matching**: Uses keyword extraction and fuzzy search to match model names to presets
- **⚙️ Configurable Sensitivity**: Adjust the match threshold from strict to lenient
- **🛡️ Fallback Support**: Specify a default preset when no match is found
- **📊 Mapping History**: Track which presets were applied to which models
- **🎛️ Dual Access**: Access settings via extensions menu or settings panel

## Installation

1. Navigate to your SillyTavern installation directory
2. Go to `public/scripts/extensions/`
3. Clone or copy this extension into the directory
4. Restart SillyTavern or refresh the page
5. The extension will automatically load

## Usage

### Accessing Settings

**Method 1: Extensions Menu (Quick Access)**
1. Click the wand button (🪄) in the bottom left of SillyTavern
2. Click "Models Presets" from the dropdown menu
3. Configure your settings in the popup

**Method 2: Settings Panel**
1. Click the settings icon in SillyTavern
2. Navigate to the "Extensions" section
3. Find "Models Presets" and expand the drawer
4. Configure your settings

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

### Fallback Preset
Select which preset to use when no matching preset is found for a model name. This ensures you always have a preset applied.

**Default**: `Default`

### Match Sensitivity (Threshold)
Adjust how strict or lenient the matching algorithm is:

- **0.0 (Strict)**: Requires near-exact matches
- **0.5 (Balanced)**: Default setting, good for most use cases
- **1.0 (Lenient)**: Accepts very loose matches

**Default**: `0.5`

**Tip**: If you're getting too many incorrect matches, lower the threshold. If the extension isn't finding matches, increase it.

### Mapping History
View a table showing which models you've used and which presets were automatically applied. This helps you understand and verify the extension's behavior.

- **Clear History**: Remove all recorded mappings to start fresh

## Troubleshooting

### Extension Not Working

**Issue**: Presets aren't changing when I switch models

**Solutions**:
1. Check that the extension is enabled in settings
2. Verify you have presets created in SillyTavern
3. Ensure your preset names can match your model names (e.g., a preset called "Claude" for Claude models)
4. Check the browser console for error messages

### Incorrect Preset Applied

**Issue**: The wrong preset is being selected for my model

**Solutions**:
1. Lower the match sensitivity threshold for stricter matching
2. Rename your presets to better match your model names
3. Check the mapping history to see what matched
4. Set a specific fallback preset that works well as a default

### No Preset Applied

**Issue**: No preset is applied when I change models

**Solutions**:
1. Check that you have a fallback preset configured
2. Verify the fallback preset exists in your presets list
3. Increase the match sensitivity threshold
4. Create presets with names that match your model keywords

### Menu Button Not Appearing

**Issue**: Can't find the "Models Presets" button in the extensions menu

**Solutions**:
1. Ensure the extension is properly installed in the extensions directory
2. Check the browser console for loading errors
3. Refresh SillyTavern completely
4. Verify the manifest.json file is present and valid

## Technical Details

### Matching Algorithm

1. **Keyword Extraction**:
   - Splits model name by hyphens, underscores, dots, and spaces
   - Filters out words shorter than 3 characters
   - Removes pure numeric values
   - Converts to lowercase for case-insensitive matching

2. **Fuzzy Search**:
   - Uses Fuse.js library for fuzzy string matching
   - Configurable threshold (0.0 = exact, 1.0 = very fuzzy)
   - Searches against all available preset names
   - Returns the first match above threshold

3. **Preset Application**:
   - Uses SillyTavern's slash command system
   - Executes `/preset <name>` command programmatically
   - Stores successful mappings for history tracking

### Events Used

- `CHATCOMPLETION_MODEL_CHANGED`: Triggers when the AI model changes

### Dependencies

- Fuse.js (included with SillyTavern)
- SillyTavern's extension system
- SillyTavern's preset manager
- SillyTavern's slash command system

## Development

### File Structure

```
SillyTavern-ModelsPresets/
├── index.js           # Main extension logic
├── manifest.json      # Extension metadata
├── settings.html      # Settings UI template
├── style.css          # Extension styles
└── README.md          # This file
```

### Key Functions

- `findMatchingPreset(modelName)`: Matches model to preset
- `applyPreset(presetName)`: Applies a preset by name
- `onModelChanged(modelName)`: Handles model change events
- `showModelsPresetsSettings()`: Shows settings popup
- `addModelsPresetsMenuButton()`: Adds extension to menu

## Credits

- **Author**: Ameowra
- **Repository**: [SillyTavern-ModelsPresets](https://github.com/Red-dish/SillyTavern-ModelsPresets)
- **Version**: 1.0.0

## License

Please refer to the repository for license information.

## Contributing

Contributions are welcome! Please visit the [GitHub repository](https://github.com/Red-dish/SillyTavern-ModelsPresets) to:
- Report bugs
- Suggest features
- Submit pull requests

---

**Enjoy seamless preset switching with SillyTavern-ModelsPresets!** 🎯
