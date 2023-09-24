import { html, HtmlEscapedString } from "~/deps.ts";

export const Html = ({
    head,
    children,
}: {
    head: HeadProps,
    children?: HtmlEscapedString | HtmlEscapedString[] | undefined;
}): HtmlEscapedString => html`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${head.title}</title>
    <base href="${head.baseUrl}" />
    <link rel="preload" href="/static/htmx.min.js" as="script" />
    <script src="/static/htmx.min.js" defer></script>
    <link rel="preload" href="/static/hyperscript.min.js" as="script" />
    <script src="/static/hyperscript.min.js" defer></script>
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
    baseUrl: string;
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
