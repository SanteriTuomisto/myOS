// vue-resizable ships no type declarations
declare module 'vue-resizable' {
  import type { Component } from 'vue';

  const VueResizable: Component | { default: Component };
  export default VueResizable;
}
