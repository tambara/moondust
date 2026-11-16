
import { Context, Hash, Liquid, Tag, TagToken, Value, type Emitter, type TopLevelToken } from "liquidjs";
import { marked } from "marked";
import type { PageInput } from "~/features/pages/services/page-service.server";

export const engine = new Liquid({
  strictFilters: false,
  strictVariables: false,
  lenientIf: true,
  ownPropertyOnly: true,
});

// マークダウンをHTMLに変換
engine.registerTag('fmt_md', {
  parse: function (tagToken: TagToken, remainTokens: TopLevelToken[]) {
    this.value = new Value(tagToken.args, engine)
  },
  render: function* (context: Context) {
    const str = (yield this.value.value(context)) as string;
    const result: string = yield marked.parse(str);
    return result
  }
});

// 入力をliquidのテンプレートとして、現在の引数を渡して解析して返す。
engine.registerTag('parse_and_render', {
  parse: function (tagToken: TagToken, remainTokens: TopLevelToken[]) {
    this.value = new Value(tagToken.args, engine)
  },
  render: function* (context: Context, emitter: Emitter) {
    const str = (yield this.value.value(context)) as string;
    const result: string = yield engine.parseAndRender(str, context);


    // const pageTemplates = engine.parse(str);

    // const result: string = yield engine.renderer.renderTemplates(
    //   pageTemplates,
    //   context,
    //   emitter
    // );
    return result
  }
});

