import { Fuse } from '../../../lib.js';
import { event_types, eventSource, saveSettingsDebounced } from '../../../script.js';
import { extension_settings, renderExtensionTemplateAsync } from '../../extensions.js';
import { getPresetManager } from '../../preset-manager.js';
import { SlashCommandParser } from '../../slash-commands/SlashCommandParser.js';
import { SlashCommandScope } from '../../slash-commands/SlashCommandScope.js';
import { SlashCommandAbortController } from '../../slash-commands/SlashCommandAbortController.js';
import { SlashCommandDebugController } from '../../slash-commands/SlashCommandDebugController.js';

const MODULE_NAME = 'SillyTavern-ModelsPresets';

const DEFAULT_SETTINGS = {
    enabled: true,
    fallbackPreset: 'Default',
    matchThreshold: 0.5,
    lastMappings: {},
};

/**
 * Get named arguments for slash command execution
 * @returns {object} Named arguments for slash command
 */
function getNamedArguments() {
    return {
        _scope: new SlashCommandScope(),
        _abortController: new SlashCommandAbortController(),
        _debugController: new SlashCommandDebugController(),
        _parserFlags: {},
        _hasUnnamedArgument: false,
        quiet: 'true',
    };
}

/**
 * Finds a matching preset for the given model name
 * @param {string} modelName - The model name to match
 * @returns {string|null} The matched preset name or null
 */
function findMatchingPreset(modelName) {
    if (!modelName || typeof modelName !== 'string') {
        console.debug('[Models Presets] Invalid model name:', modelName);
        return null;
    }

    const presetManager = getPresetManager();
    if (!presetManager) {
        console.debug('[Models Presets] Preset manager not found');
        return null;
    }

    const allPresets = presetManager.getAllPresets();
    if (!Array.isArray(allPresets) || allPresets.length === 0) {
        console.debug('[Models Presets] No presets available');
        return null;
    }

    // Extract keywords from model name (e.g., "claude-sonnet-4-5" -> ["claude", "sonnet"])
    const modelKeywords = modelName.toLowerCase()
        .split(/[-_.\s]+/)
        .filter(word => word.length > 2 && !/^\d+$/.test(word)); // Filter out short words and pure numbers

    console.debug('[Models Presets] Model keywords:', modelKeywords);

    // Use Fuse.js for fuzzy matching
    const fuse = new Fuse(allPresets, {
        threshold: extension_settings.modelsPresets.matchThreshold,
        ignoreLocation: true,
        keys: [],
    });

    // Try to find a match for each keyword
    for (const keyword of modelKeywords) {
        const results = fuse.search(keyword);
        if (results.length > 0) {
            const matchedPreset = results[0].item;
            console.log(`[Models Presets] Matched "${keyword}" to preset "${matchedPreset}"`);
            return matchedPreset;
        }
    }

    // No match found
    console.debug('[Models Presets] No matching preset found for model:', modelName);
    return null;
}

/**
 * Applies a preset by name
 * @param {string} presetName - The preset name to apply
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function applyPreset(presetName) {
    if (!presetName || typeof presetName !== 'string') {
        console.error('[Models Presets] Invalid preset name:', presetName);
        return false;
    }

    try {
        const presetCommand = SlashCommandParser.commands['preset'];
        if (!presetCommand) {
            console.error('[Models Presets] Preset command not found');
            return false;
        }

        const args = getNamedArguments();
        const result = await presetCommand.callback(args, presetName);

        if (result) {
            console.log(`[Models Presets] Successfully applied preset: ${presetName}`);
            return true;
        } else {
            console.warn(`[Models Presets] Failed to apply preset: ${presetName}`);
            return false;
        }
    } catch (error) {
        console.error('[Models Presets] Error applying preset:', error);
        return false;
    }
}

/**
 * Handles model change events
 * @param {string} modelName - The new model name
 */
async function onModelChanged(modelName) {
    if (!extension_settings.modelsPresets.enabled) {
        console.debug('[Models Presets] Extension is disabled');
        return;
    }

    console.log('[Models Presets] Model changed to:', modelName);

    // Find matching preset
    let matchedPreset = findMatchingPreset(modelName);

    // If no match, use fallback preset
    if (!matchedPreset) {
        matchedPreset = extension_settings.modelsPresets.fallbackPreset;
        console.log(`[Models Presets] Using fallback preset: ${matchedPreset}`);
    }

    // Apply the preset
    if (matchedPreset) {
        const success = await applyPreset(matchedPreset);

        // Store the mapping for UI display
        if (success) {
            extension_settings.modelsPresets.lastMappings[modelName] = matchedPreset;
            saveSettingsDebounced();
        }
    }
}

/**
 * Renders the settings UI
 */
async function renderSettings() {
    const settingsHtml = await renderExtensionTemplateAsync(MODULE_NAME, 'settings', {
        enabled: extension_settings.modelsPresets.enabled,
        fallbackPreset: extension_settings.modelsPresets.fallbackPreset,
        matchThreshold: extension_settings.modelsPresets.matchThreshold,
        mappings: extension_settings.modelsPresets.lastMappings,
    });

    $('#models_presets_settings').html(settingsHtml);

    // Populate fallback preset dropdown
    const presetManager = getPresetManager();
    if (presetManager) {
        const allPresets = presetManager.getAllPresets();
        const fallbackSelect = $('#models_presets_fallback');
        fallbackSelect.empty();

        allPresets.forEach(preset => {
            const option = $('<option></option>')
                .attr('value', preset)
                .text(preset);

            if (preset === extension_settings.modelsPresets.fallbackPreset) {
                option.attr('selected', 'selected');
            }

            fallbackSelect.append(option);
        });
    }
}

/**
 * Initializes the extension
 */
(async function() {
    // Initialize settings
    extension_settings.modelsPresets = extension_settings.modelsPresets || structuredClone(DEFAULT_SETTINGS);

    // Merge in any missing default settings
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (extension_settings.modelsPresets[key] === undefined) {
            extension_settings.modelsPresets[key] = DEFAULT_SETTINGS[key];
        }
    }

    console.log('[Models Presets] Extension initialized', extension_settings.modelsPresets);

    // Register event listener for model changes
    eventSource.on(event_types.CHATCOMPLETION_MODEL_CHANGED, onModelChanged);

    // Add settings UI to the extensions panel
    const settingsContainer = $('#extensions_settings2');
    const settingsBlock = `
        <div id="models_presets_container" class="models-presets-container">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Models Presets</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div id="models_presets_settings"></div>
                </div>
            </div>
        </div>
    `;
    settingsContainer.append(settingsBlock);

    // Render settings
    await renderSettings();

    // Event handlers
    $(document).on('change', '#models_presets_enabled', function() {
        extension_settings.modelsPresets.enabled = $(this).prop('checked');
        saveSettingsDebounced();
        console.log('[Models Presets] Enabled:', extension_settings.modelsPresets.enabled);
    });

    $(document).on('change', '#models_presets_fallback', function() {
        extension_settings.modelsPresets.fallbackPreset = $(this).val();
        saveSettingsDebounced();
        console.log('[Models Presets] Fallback preset changed to:', extension_settings.modelsPresets.fallbackPreset);
    });

    $(document).on('input', '#models_presets_threshold', function() {
        extension_settings.modelsPresets.matchThreshold = parseFloat($(this).val());
        $('#models_presets_threshold_value').text(extension_settings.modelsPresets.matchThreshold.toFixed(2));
        saveSettingsDebounced();
        console.log('[Models Presets] Match threshold changed to:', extension_settings.modelsPresets.matchThreshold);
    });

    $(document).on('click', '#models_presets_clear_mappings', function() {
        extension_settings.modelsPresets.lastMappings = {};
        saveSettingsDebounced();
        renderSettings();
        toastr.success('Mapping history cleared', 'Models Presets');
    });

    console.log('[Models Presets] Extension loaded successfully');
})();