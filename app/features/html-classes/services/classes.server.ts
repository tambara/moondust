import { compile } from "tailwindcss";
import { htmlClasses, systemSettings } from "~/db/schema";

import tailwindStyles from "tailwindcss/index.css?raw";
import { extractClasses } from "~/lib/extract_classes";
import type { createDb } from "~/db";

type Database = ReturnType<typeof createDb>;

export async function updateClasses(db: Database, { recordType, recordId, html }: { recordType: string, recordId: string, html: string }) {
    const classes = await extractClasses(
        html
    );
    await db
        .insert(htmlClasses)
        .values({
            id: crypto.randomUUID(),
            recordType: recordType,
            recordId: recordId,
            value: classes.join(" "),
        })
        .onConflictDoUpdate({
            target: [
                htmlClasses.recordType,
                htmlClasses.recordId,
            ],
            set: {
                value: classes.join(" "),
            },
        });
}

export async function updateTailwind(db: Database
) {
    const compiler = await compile('@import "tailwindcss";', {
        loadStylesheet: async (id, base) => {
            if (id === "tailwindcss") {
                return {
                    path: "virtual:tailwindcss/index.css",
                    base,
                    content: tailwindStyles,
                };
            }

            throw new Error(`Unknown stylesheet: ${id}`);
        },
    });

    const htmlClassesRows = await db.query.htmlClasses.findMany();
    const classes = htmlClassesRows.flatMap((row) =>
        row.value.split(/\s+/).filter(Boolean),
    );

    const css = compiler.build(classes);
    await db
        .insert(systemSettings)
        .values({
            name: "tailwindcss",
            value: css,
        })
        .onConflictDoUpdate({
            target: systemSettings.name,
            set: {
                value: css,
            },
        });
}