import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import MyInput from './MyInput.vue';

describe('MyInput', () => {
  it('works with v-model', async () => {
    const Parent = defineComponent({
      components: { MyInput },
      setup: () => ({ text: ref('start') }),
      template: '<MyInput v-model="text" /><span>{{ text }}</span>',
    });
    const wrapper = mount(Parent);
    const input = wrapper.find('input');
    expect(input.element.value).toBe('start');

    await input.setValue('changed');
    expect(wrapper.find('span').text()).toBe('changed');

    (wrapper.vm as unknown as { text: string }).text = 'from parent';
    await wrapper.vm.$nextTick();
    expect(input.element.value).toBe('from parent');
  });

  it('shows the value prop and emits input with the new value', async () => {
    const wrapper = mount(MyInput, { props: { value: 'www.boogle.com' } });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('www.boogle.com');

    await input.setValue('typed');
    expect(wrapper.emitted('input')).toEqual([['typed']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([['typed']]);
  });

  it('prefers modelValue over value', () => {
    const wrapper = mount(MyInput, { props: { value: 'a', modelValue: 'b' } });
    expect(wrapper.find('input').element.value).toBe('b');
  });

  it('defaults to a text input and accepts other types', () => {
    expect(mount(MyInput).find('input').attributes('type')).toBe('text');
    expect(mount(MyInput, { props: { type: 'password' } }).find('input').attributes('type')).toBe('password');
  });
});
