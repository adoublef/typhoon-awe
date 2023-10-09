import { html, HtmlEscapedString } from "~/deps.ts";

const api =
    "https://assets.adoublef.dev"; 
    // "http://localhost:4507";

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
    <link rel="preload" as="font" href="${api}/fonts/v/space_grotesk.woff2" type="font/woff2" />
    <link rel="preload" as="font" href="${api}/fonts/v/lexend.woff2" type="font/woff2"  />
    <link rel="preload" as="script" href="${api}/scripts/htmx.min.js" />
    <link rel="preload" as="script" href="${api}/scripts/hyperscript.min.js" />
    <link rel="stylesheet" href="${api}/stylesheets/index.css">
    <script src="${api}/scripts/htmx.min.js" defer></script>
    <script src="${api}/scripts/hyperscript.min.js" defer></script>
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
