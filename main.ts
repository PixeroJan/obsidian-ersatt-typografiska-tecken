import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, Platform } from 'obsidian';

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
}

export default class CitationsPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        console.log('Loading Citations plugin');

        // Lägg till kommando för att ersätta typografiska tecken
        this.addCommand({
            id: 'ersatt-typografiska tecken',
            name: 'Ersätt typografiska tecken',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                this.citationsPlugin(editor);
            }
        });

        // Lägg till ett ribbon-ikon (fungerar på desktop)
        if (!Platform.isMobile) {
            const ribbonIconEl = this.addRibbonIcon('quote-glyph', 'Ersätt typografiska tecken', (evt: MouseEvent) => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    this.citationsPlugin(view.editor);
                }
            });
            ribbonIconEl.addClass('my-plugin-ribbon-class');
        }

        // Lägg till en mobilvänlig knapp i sidfältet (fungerar på iOS)
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                menu.addItem((item) => {
                    item
                        .setTitle('Ersätt typografiska tecken')
                        .setIcon('quote-glyph')
                        .onClick(() => {
                            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                            if (view) {
                                this.citationsPlugin(view.editor);
                            }
                        });
                });
            })
        );

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        if (!Platform.isMobile) {
            const statusBarItemEl = this.addStatusBarItem();
            statusBarItemEl.setText('Status Bar Text');
        }

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        if (!Platform.isMobile) {
            this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
                console.log('click', evt);
            });
        }

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
    }

    citationsPlugin(editor: Editor) {
        // Hämta aktuell text
        const text = editor.getValue();
        //new Notice('Original text: ' + text);
        
        // Utför ersättningar
        let nyText = text;
        
        // 1. Ersätt ,'' med ",
        nyText = nyText.replace(/,\u0027\u0027/g, '\u201D,');
        //new Notice('After replacing ,\'\' with ",: ' + nyText);
        
        // 2. Ersätt ," med ",
        nyText = nyText.replace(/,\u0022/g, '\u201D,');
        //new Notice('After replacing ," with ",: ' + nyText);
        
        // 3. Ersätt '' med ”
        nyText = nyText.replace(/\u0027\u0027/g, '\u201D');
        //new Notice('After replacing \'\' with ”: ' + nyText);
        
        // 4. Ersätt enkla raka citattecken (') med enkla typografiska citattecken (’)
        nyText = nyText.replace(/\u0027/g, '\u2019');
        //new Notice('After replacing \' with ’: ' + nyText);
        
        // 5. Ersätt dubbla raka citattecken (") med dubbla typografiska citattecken (”)
        nyText = nyText.replace(/\u0022/g, '\u201D');
        //new Notice('After replacing " with ”: ' + nyText);

        // 6. Ersätt ," med ",
        nyText = nyText.replace(/,\u201D/g, '\u201D,');
        //new Notice('After replacing ," with ",: ' + nyText);

        // 7. Ersätt start curly quote (U+201C) med end curly quote (U+201C)
        nyText = nyText.replace(/\u201C/g, '\u201D');
        //new Notice('After replacing start curly quote with end curly quote: ' + nyText);
        
        // Uppdatera texten i editorn
        if (text !== nyText) {
            editor.setValue(nyText);
          //  new Notice('Updated text: ' + nyText);
          //  new Notice("Citationstecken ersättningar genomförda.");
        } else {
            new Notice("Inga ersättningar behövdes.");
        }
    }

    onunload() {
        console.log('Avlastar Citations Plugin');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: CitationsPlugin;

    constructor(app: App, plugin: CitationsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('Change citations')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));
    }
}