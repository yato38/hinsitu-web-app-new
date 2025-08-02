import { Client } from '@notionhq/client';

// Notionクライアントの初期化
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// ページを作成する関数
export async function createNotionPage(
  parentId: string,
  title: string,
  content?: string
) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: parentId,
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: content ? [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content,
                },
              },
            ],
          },
        },
      ] : [],
    });

    return response;
  } catch (error) {
    console.error('Notionページ作成エラー:', error);
    throw error;
  }
}

// ページを更新する関数
export async function updateNotionPage(
  pageId: string,
  title?: string,
  content?: string
) {
  try {
    const updates: Record<string, unknown> = {};

    // タイトルの更新
    if (title) {
      updates.properties = {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      };
    }

    // ページプロパティの更新
    if (Object.keys(updates).length > 0) {
      await notion.pages.update({
        page_id: pageId,
        ...updates,
      });
    }

    // コンテンツの更新
    if (content) {
      // 既存のブロックを削除
      const existingBlocks = await notion.blocks.children.list({
        block_id: pageId,
      });

      for (const block of existingBlocks.results) {
        await notion.blocks.delete({
          block_id: block.id,
        });
      }

      // 新しいコンテンツを追加
      await notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Notionページ更新エラー:', error);
    throw error;
  }
}

// ページを取得する関数
export async function getNotionPage(pageId: string) {
  try {
    const page = await notion.pages.retrieve({
      page_id: pageId,
    });

    const blocks = await notion.blocks.children.list({
      block_id: pageId,
    });

    return {
      page,
      blocks: blocks.results,
    };
  } catch (error) {
    console.error('Notionページ取得エラー:', error);
    throw error;
  }
}

// データベースのページ一覧を取得する関数
export async function getNotionPages(databaseId: string) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    return response.results;
  } catch (error) {
    console.error('Notionページ一覧取得エラー:', error);
    throw error;
  }
} 