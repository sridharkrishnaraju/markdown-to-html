# Usage & API

It is a standard custom element, so it works with no wrapper in plain HTML, React, Vue, Svelte and Astro.

## Plain HTML

```html
<script src="markdown-tool.js"></script>
<markdown-tool></markdown-tool>
```

## React

```jsx
import "@sgbp/markdown-tool";
export default function Page() { return <markdown-tool />; }
```

## Vue

```vue
<script setup>
import "@sgbp/markdown-tool";
</script>

<template>
  <markdown-tool />
</template>
```

---

Prefer to just use it without installing anything? The
[live Markdown to HTML Converter](https://sgbp.tech/tools/markdown-to-html) is hosted and ready to go.
