import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import TerminalWindow from './TerminalWindow.vue';
import { createTestPinia } from '@/test/utils';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';

describe('TerminalWindow', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const mountTerminal = () => mount(TerminalWindow, { global: { plugins: [pinia] }, attachTo: document.body });

  const run = async (wrapper: ReturnType<typeof mountTerminal>, text: string) => {
    const input = wrapper.find('input');
    await input.setValue(text);
    await input.trigger('keydown', { key: 'Enter' });
  };

  const lastResponse = (wrapper: ReturnType<typeof mountTerminal>) =>
    wrapper.findAll('.response').at(-1)?.text();

  const currentPrompt = (wrapper: ReturnType<typeof mountTerminal>) =>
    wrapper.find('.input-row .prompt').text();

  it('shows the version and focuses the input', () => {
    const wrapper = mountTerminal();

    expect(wrapper.text()).toContain(`myOs ${__APP_VERSION__}`);
    expect(document.activeElement).toBe(wrapper.find('input').element);
    wrapper.unmount();
  });

  it('echoes the command with its prompt and clears the input', async () => {
    const wrapper = mountTerminal();

    await run(wrapper, '  help  ');

    expect(wrapper.find('.prompt').text()).toBe('$ home:~');
    expect(wrapper.text()).toContain('help');
    expect(lastResponse(wrapper)).toBe('commands: ls, cd {0}, open {0}');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
    wrapper.unmount();
  });

  it('lists the root with ls', async () => {
    const wrapper = mountTerminal();

    await run(wrapper, 'ls');

    expect(lastResponse(wrapper)).toContain('My Computer (folder), Start Menu (folder)');
    wrapper.unmount();
  });

  it('changes folder with cd and reads its current contents', async () => {
    const wrapper = mountTerminal();

    await run(wrapper, 'cd my computer');
    expect(currentPrompt(wrapper)).toBe('$ home/My Computer:~');

    useFileSystemStore().addItem(useFileSystemStore().findFolderPath(0)!, 'file', 'Notes');
    await run(wrapper, 'ls');
    expect(lastResponse(wrapper)).toBe('Documents (folder), Text (file), Notes (file),');

    await run(wrapper, 'cd ..');
    await run(wrapper, 'cd ..');
    expect(currentPrompt(wrapper)).toBe('$ home:~');
    wrapper.unmount();
  });

  it('reports a missing folder', async () => {
    const wrapper = mountTerminal();

    await run(wrapper, 'cd browser');

    expect(lastResponse(wrapper)).toBe('No such folder');
    expect(currentPrompt(wrapper)).toBe('$ home:~');
    wrapper.unmount();
  });

  it('opens an app with open', async () => {
    const wrapper = mountTerminal();

    await run(wrapper, 'open terminal');

    expect(useApplicationsStore().applications).toEqual([
      expect.objectContaining({ name: 'Terminal', type: 'terminal', fileSystemId: 20 }),
    ]);
    wrapper.unmount();
  });

  it('records empty commands without a response', async () => {
    const wrapper = mountTerminal();

    await run(wrapper, '   ');

    expect(wrapper.findAll('.prompt')).toHaveLength(2);
    expect(wrapper.findAll('.response')).toHaveLength(0);
    wrapper.unmount();
  });
});
