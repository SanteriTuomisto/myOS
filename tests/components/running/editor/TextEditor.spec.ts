import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import TextEditor from '@/components/running/editor/TextEditor.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';

// Minimal Quill stand-in: the editor only needs a root element and HTML pasting
vi.mock('quill', () => ({
  default: class {
    root: HTMLDivElement;
    clipboard: { dangerouslyPasteHTML: (html: string) => void };

    constructor(container: HTMLElement) {
      this.root = document.createElement('div');
      this.root.className = 'ql-editor';
      container.appendChild(this.root);
      this.clipboard = {
        dangerouslyPasteHTML: (html: string) => {
          this.root.innerHTML = html;
        },
      };
    }
  },
}));
vi.mock('quill/dist/quill.snow.css', () => ({}));

describe('TextEditor', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const mountEditor = (props: { id: number; fileSystemId?: number }) =>
    mount(TextEditor, { props, global: { plugins: [pinia] } });

  it('loads the saved file content', () => {
    useFileSystemStore().saveFileContent(4, '<p>hello</p>');

    const wrapper = mountEditor({ id: 0, fileSystemId: 4 });

    expect(wrapper.find('.ql-editor').html()).toContain('<p>hello</p>');
  });

  it('starts empty for a file without content', () => {
    const wrapper = mountEditor({ id: 0, fileSystemId: 5 });

    expect(wrapper.find('.ql-editor').text()).toBe('');
  });

  it('saves the content and closes the window', async () => {
    const apps = useApplicationsStore();
    const fs = useFileSystemStore();
    const app = apps.openApplication({ name: 'Text', type: 'file', fileSystemId: 4 });
    const wrapper = mountEditor({ id: app.id, fileSystemId: 4 });

    wrapper.find('.ql-editor').element.innerHTML = '<p>edited</p>';
    await wrapper.find('.save-btn').trigger('click');

    expect(fs.getFileContent(4)).toBe('<p>edited</p>');
    expect(apps.applications).toEqual([]);
  });

  it('just closes when there is no file to save to', async () => {
    const apps = useApplicationsStore();
    const app = apps.openApplication({ name: 'Text', type: 'file' });
    const wrapper = mountEditor({ id: app.id });

    await wrapper.find('.save-btn').trigger('click');

    expect(useFileSystemStore().fileData).toEqual({});
    expect(apps.applications).toEqual([]);
  });
});
