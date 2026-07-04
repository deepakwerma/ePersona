"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import {
  PanelLeft,
  ChevronsUpDown,
  ChevronRight,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  Plus,
  LogOut,
  BadgeCheck,
} from "lucide-react";

// ---------- Data ----------

type NavItem = {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  items?: { title: string; onClick: () => void }[];
};

const NAV_MAIN: NavItem[] = [
  {
    title: "Playground",
    icon: SquareTerminal,
    items: [
      { title: "History", onClick: () => {} },
      { title: "Starred", onClick: () => {} },
      { title: "Settings", onClick: () => {} },
    ],
  },
  {
    title: "Models",
    icon: Bot,
    items: [
      { title: "Genesis", onClick: () => {} },
      { title: "Explorer", onClick: () => {} },
    ],
  },
  {
    title: "Documentation",
    icon: BookOpen,
    items: [
      { title: "Introduction", onClick: () => {} },
      { title: "Get Started", onClick: () => {} },
    ],
  },
  {
    title: "Settings",
    icon: Settings2,
    items: [
      { title: "General", onClick: () => {} },
      { title: "Billing", onClick: () => {} },
    ],
  },
];

// ---------- Styles ----------

const rowStyle = (collapsed: boolean): React.CSSProperties => ({
  width: collapsed ? undefined : "100%",
  justifyContent: "flex-start",
});

const sectionLabelStyle: React.CSSProperties = {
  padding: "var(--spacing-2) var(--spacing-3) var(--spacing-1)",
};

// ---------- Team switcher ----------

function TeamSwitcher({ collapsed }: { collapsed: boolean }) {
  return (
    <div style={{ padding: "var(--spacing-2)" }}>
      <DropdownMenu
        button={{
          label: collapsed ? "" : "Acme Inc",
          variant: "ghost",
          size: "lg",
          isIconOnly: collapsed,
          icon: (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--color-accent, #4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PanelLeft size={16} color="white" />
            </div>
          ),
          style: rowStyle(collapsed),
        }}
        hasChevron={!collapsed}
        items={[
          {
            type: "section",
            title: "Teams",
            items: [{ label: "Acme Inc" }, { label: "Acme Corp" }],
          },
          { type: "divider" },
          { label: "Add team", icon: <Plus size={14} /> },
        ]}
      />
    </div>
  );
}

// ---------- Nav main (collapsible groups) ----------

function NavMain({ collapsed }: { collapsed: boolean }) {
  const [expanded, setExpanded] = useState<string | null>("Playground");

  return (
    <VStack gap={0} style={{ padding: "0 var(--spacing-2)" }}>
      {!collapsed && (
        <Text type="supporting" color="secondary" style={sectionLabelStyle}>
          Platform
        </Text>
      )}
      {NAV_MAIN.map((item) => {
        const isOpen = expanded === item.title;
        return (
          <VStack key={item.title} gap={0}>
            <Button
              label={item.title}
              icon={<item.icon size={16} />}
              endContent={
                !collapsed && item.items ? (
                  <ChevronRight
                    size={14}
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "none",
                      transition: "transform 150ms ease",
                    }}
                  />
                ) : undefined
              }
              variant="ghost"
              isIconOnly={collapsed}
              style={rowStyle(collapsed)}
              onClick={() =>
                item.items && setExpanded(isOpen ? null : item.title)
              }
            />
            {!collapsed && isOpen && item.items && (
              <VStack
                gap={0}
                style={{
                  marginLeft: 12,
                  paddingLeft: "var(--spacing-3)",
                  borderLeft: "1px solid var(--border)",
                }}
              >
                {item.items.map((sub) => (
                  <Button
                    key={sub.title}
                    label={sub.title}
                    variant="ghost"
                    size="sm"
                    style={rowStyle(false)}
                    onClick={sub.onClick}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        );
      })}
    </VStack>
  );
}

// ---------- User footer ----------

function NavUser({ collapsed }: { collapsed: boolean }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div
      style={{
        padding: "var(--spacing-2)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <DropdownMenu
        button={{
          label: collapsed ? "" : (user?.fullName ?? "Account"),
          variant: "ghost",
          size: "lg",
          isIconOnly: collapsed,
          icon: (
            <Avatar
              name={user?.fullName ?? "User"}
              src={user?.imageUrl}
              size="small"
            />
          ),
          style: rowStyle(collapsed),
        }}
        hasChevron={!collapsed}
        items={[
          { label: "Account", icon: <BadgeCheck size={14} /> },
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
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? 64 : 272;

  return (
    <VStack
      style={{
        width,
        height: "100%",
        borderRight: "1px solid var(--border)",
        flexShrink: 0,
        transition: "width 160ms ease",
        justifyContent: "space-between",
      }}
    >
      <VStack gap={0}>
        <TeamSwitcher collapsed={collapsed} />
        <div
          style={{
            borderTop: "1px solid var(--border)",
            margin: "0 var(--spacing-2)",
          }}
        />
        <NavMain collapsed={collapsed} />
      </VStack>

      <VStack gap={0}>
        <div style={{ padding: "var(--spacing-2)" }}>
          <Button
            label="Toggle sidebar"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<PanelLeft size={16} />}
            onClick={() => setCollapsed((v) => !v)}
          />
        </div>
        <NavUser collapsed={collapsed} />
      </VStack>
    </VStack>
  );
}
