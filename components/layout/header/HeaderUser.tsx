import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { User } from "@heroui/react";
import { Icon } from "@iconify/react";
import { UserWithDetails } from "@/interface";
import { signOut } from "next-auth/react";

const HeaderUser = ({ user }: { user: UserWithDetails }) => {
  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src: user.ProfilePicture?.url || "/images/default_user.png",
            }}
            className="transition-transform"
            description={user.email}
            name={user.name}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" variant="flat">
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-bold">Signed in as</p>
            <p className="font-bold">{user.email}</p>
          </DropdownItem>
          <DropdownItem
            key="admin_dashboard"
            href="/admin/dashboard"
            startContent={<Icon icon="tabler:user-cog" />}
          >
            Admin Dashboard
          </DropdownItem>
          <DropdownItem
            key="app_dashboard"
            href="/app/dashboard"
            startContent={<Icon icon="hugeicons:ai-brain-04" />}
          >
            App Dashboard
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            startContent={<Icon icon="tabler:logout-2" />}
            onPress={() => signOut()}
          >
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default HeaderUser;
