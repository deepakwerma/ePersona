"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Avatar } from "@astryxdesign/core/Avatar";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import {
  PanelLeft,
  SquarePen,
  MessageSquare,
  Settings,
  LogOut,
  BadgeCheck,
} from "lucide-react";

// ---------- Types ----------

type ChatHistoryItem = {
  id: string;
  title: string;
};

// Placeholder — wire this to real data (Neon/Clerk userId) later
const CHAT_HISTORY: ChatHistoryItem[] = [];

// ---------- Shared styles ----------

const fullWidthRow: React.CSSProperties = {
  width: "100%",
  justifyContent: "flex-start",
};

// ---------- Logo (text-based, no image, inherits theme font) ----------

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack
      gap={2}
      vAlign="center"
      style={{ padding: "var(--spacing-3) var(--spacing-4)", height: 56 }}
    >
      <Text
        type="label"
        weight="semibold"
        style={{ fontSize: 18, letterSpacing: "-0.02em" }}
      >
        {collapsed ? "eP" : "ePersona"}
      </Text>
    </HStack>
  );
}

// ---------- Chat history list ----------

function ChatHistory({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <VStack
      gap={1}
      style={{ padding: "0 var(--spacing-2)", flex: 1, overflowY: "auto" }}
    >
      <Text
        type="supporting"
        color="secondary"
        style={{
          padding: "var(--spacing-2) var(--spacing-3) var(--spacing-1)",
        }}
      >
        Chats
      </Text>
      {CHAT_HISTORY.map((chat) => (
        <Button
          key={chat.id}
          label={chat.title}
          icon={<MessageSquare size={16} />}
          variant="ghost"
          size="sm"
          style={fullWidthRow}
          onClick={() => {}}
        />
      ))}
    </VStack>
  );
}

// ---------- Bottom profile/settings ----------
// Uses a plain <div> with raw flexbox (not HStack/VStack) to guarantee
// left-alignment regardless of Astryx's default cross-axis centering.

function ProfileFooter({ collapsed }: { collapsed: boolean }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div
      style={{
        padding: "var(--spacing-3) var(--spacing-2)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
      }}
    >
      <DropdownMenu
        button={{
          label: collapsed ? "" : (user?.fullName ?? "Account"),
          variant: "ghost",
          isIconOnly: collapsed,
          icon: (
            <Avatar
              name={user?.fullName ?? "User"}
              src={user?.imageUrl}
              size="small"
            />
          ),
          style: {
            justifyContent: "flex-start",
            width: collapsed ? "auto" : "100%",
            marginRight: "auto",
          },
        }}
        hasChevron={!collapsed}
        items={[
          { label: "Profile", icon: <BadgeCheck size={14} /> },
          { label: "Settings", icon: <Settings size={14} /> },
          { type: "divider" },
          {
            label: "Log out",
            icon: <LogOut size={14} />,
            onClick: () => signOut(),
          },
        ]}
      />
    </div>
  );
}

// ---------- Main Sidebar ----------

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const width = collapsed ? 60 : 260;

  return (
    <VStack
      style={{
        width,
        height: "100%",
        borderRight: "1px solid var(--border)",
        flexShrink: 0,
        transition: "width 160ms ease",
      }}
    >
      {/* Top: logo + toggle */}
      <HStack
        vAlign="center"
        style={{
          justifyContent: collapsed ? "center" : "space-between",
          padding: "var(--spacing-3) var(--spacing-3) var(--spacing-2)",
        }}
      >
        {!collapsed && <Logo collapsed={collapsed} />}
        <Button
          label="Toggle sidebar"
          variant="ghost"
          size="sm"
          isIconOnly
          icon={<PanelLeft size={16} />}
          onClick={() => setCollapsed((v) => !v)}
        />
      </HStack>

      {/* New chat */}
      <div style={{ padding: "var(--spacing-3) var(--spacing-2)" }}>
        <Button
          label="New chat"
          icon={<SquarePen size={16} />}
          variant="secondary"
          isIconOnly={collapsed}
          style={collapsed ? undefined : fullWidthRow}
          onClick={() => {}}
        />
      </div>

      {/* Chat history */}
      <ChatHistory collapsed={collapsed} />

      {/* Bottom profile */}
      <ProfileFooter collapsed={collapsed} />
    </VStack>
  );
}
