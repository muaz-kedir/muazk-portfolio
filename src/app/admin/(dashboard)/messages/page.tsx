import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { MessagesClient } from "@/components/admin/messages-client";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminMessagesPage() {
  const { t } = await getI18n();
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      inquiryType: true,
      subject: true,
      message: true,
      isRead: true,
      isArchived: true,
      adminReply: true,
      createdAt: true,
    },
  });

  const unread = messages.filter((m) => !m.isRead && !m.isArchived).length;

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.messages.title")}
        description={
          unread > 0
            ? t(unread === 1 ? "admin.messages.unread" : "admin.messages.unreadPlural", {
                count: unread,
              })
            : t("admin.messages.description")
        }
      />
      <div className="mt-8">
        <MessagesClient messages={messages} />
      </div>
    </AdminPage>
  );
}
