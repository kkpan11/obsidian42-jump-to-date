import { Console } from 'console';
import { App, Modal, Setting } from 'obsidian';
import ThePlugin from 'src/main';


export default class DateNLP_Modal extends Modal {
    plugin: ThePlugin;

    constructor(app: App, plugin: ThePlugin) {
        super(app);
        this.plugin = plugin;
    }

    async submitForm( dateStr: string, ctrlKey: boolean, shiftKey: boolean ) {
        await this.plugin.navigateToDNP( dateStr, this.plugin.settings.shouldConfirmBeforeCreate, ctrlKey, shiftKey );
        this.close();
    }

    onOpen(): void {
        let previewEl: HTMLElement;
        let dateInput = '';

        const getDateStr = () => {
            let cleanDateInput = dateInput;
            // @ts-ignore
            const parsedDate = this.app.plugins.getPlugin("nldates-obsidian").parseDate(dateInput)
            let parsedDateString = parsedDate.formattedString === 'Invalid date'
                ? ''
                : parsedDate.formattedString.replace('[[', '').replace(']]', '');

            return parsedDateString;
        };

        this.contentEl.createEl('form', {}, (formEl) => {
            const dateInputEl = new Setting(formEl)
                .setName('Date of DNP to open')
                .setDesc('')
                .addText((textEl) => {
                    textEl.setPlaceholder('Natural Language Date');
                    textEl.onChange((value) => {
                        dateInput = value;
                        previewEl.setText(getDateStr());
                    });
                    textEl.inputEl.addEventListener('keyup', async (e:KeyboardEvent)=>{
                        e.preventDefault();
                        if(e.ctrlKey  && previewEl.getText() !== '')
                            await this.submitForm( previewEl.getText().trim(), e.ctrlKey, e.shiftKey );
                    });
                    window.setTimeout(() => textEl.inputEl.focus(), 10);
                });
            previewEl = dateInputEl.descEl;

            formEl.createDiv('modal-button-container', (buttonContainerEl) => {
                buttonContainerEl
                    .createEl('button', { attr: { type: 'button' }, text: 'Never mind' })
                    .addEventListener('click', () => this.close());
                buttonContainerEl.createEl('button', {
                    attr: { type: 'submit' },
                    cls: 'mod-cta',
                    text: 'Goto to DNP',
                });
            });

            formEl.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                if (previewEl.getText() !== '')
                    await this.submitForm( previewEl.getText().trim(), false, false );
            });
        });



    }
}