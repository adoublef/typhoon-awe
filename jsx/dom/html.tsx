import { html, HtmlEscapedString } from "~/deps.ts";

export const Html = ({
    head: { title },
    children,
}: {
    head: HeadProps,
    children?: HtmlEscapedString | HtmlEscapedString[] | undefined;
}): HtmlEscapedString => html`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="preload" as="font" href="https://assets.adoublef.dev/4/poppins.ttf" type="font/ttf" crossorigin />
    <link rel="preload" as="font" href="https://assets.adoublef.dev/7/poppins.ttf" type="font/ttf" crossorigin />
    <link rel="stylesheet" href="https://assets.adoublef.dev/typography/style.css">
    <link rel="stylesheet" href="https://assets.adoublef.dev/color/style.css">
    <link rel="stylesheet" href="https://assets.adoublef.dev/composition/style.css">
    <link rel="preload" as="script" href="https://assets.adoublef.dev/htmx.min.js" />
    <script src="https://assets.adoublef.dev/htmx.min.js" defer></script>
    <link rel="preload" as="script" href="https://assets.adoublef.dev/hyperscript.min.js" />
    <script src="https://assets.adoublef.dev/hyperscript.min.js" defer></script>
</head>

<body hx-boost="true">${children}</body>

</html>
`;

export type HeadProps = {
    /**
     * The <base> HTML element specifies the base URL to use for all 
     * relative URLs in a document. There can be only one <base> 
     * element in a document.
     * 
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)
     */
    baseUrl?: string;
    /**
     * 
     * The <title> HTML element defines the document's title that is 
     * shown in a browser's title bar or a page's tab. It only contains 
     * text; tags within the element are ignored.
     * 
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title)
     */
    title: string;
};
