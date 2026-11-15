
import { Liquid } from "liquidjs";
import { marked } from "marked";

const engine = new Liquid();

engine.registerTag("renderPage", {
    parse() { },
     * render(context, emitter) {
        const page = context.getAll().page as {
            body: string;
        };
        const body: string = yield marked.parse(page.body);

        const pageTemplates = engine.parse(body);

        yield engine.renderer.renderTemplates(
            pageTemplates,
            context,
            emitter
        );
    },
});

export async function renderLayout(
    layoutBody: string,
    locals: Record<string, unknown>
) {
    const layoutTemplates = engine.parse(layoutBody);

    return engine.render(layoutTemplates, locals);
}
