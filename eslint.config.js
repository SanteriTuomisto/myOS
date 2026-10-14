import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default defineConfigWithVueTs(
  { ignores: ['dist/**'] },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      // Older components are plain JS; allow them until they get migrated
      'vue/block-lang': ['error', { script: { lang: 'ts', allowNoLang: true } }],
      'vue/no-unused-components': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
