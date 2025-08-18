"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Tooltip,
  CheckboxGroup,
  Form,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import {
  User,
  ProfilePicture,
  AuthProvider,
  Subscription,
} from "@/app/generated/prisma";
import { useState, useTransition } from "react";
import { userRoles } from "@/constants/constants";
import { updateUserData } from "@/actions/auth.actions";
import toast from "react-hot-toast";
import { cancelSubscription } from "@/actions/payment.action";

type UserWithRelations = User & {
  ProfilePicture: ProfilePicture | null;
  authProvider: AuthProvider[];
  Subscription: Subscription | null;
};

export default function UpdateUser({ user }: { user: UserWithRelations }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  let userRole = [];
  if (user.role) {
    userRole.push(user.role);
  }

  const [name, setName] = useState(user.name || "");
  const [roles, setRoles] = useState(userRole || []);

  const handleRolesChange = (values: string[] | string) => {
    const vals = Array.isArray(values) ? values : [values];
    const last = vals[vals.length - 1];
    setRoles(last ? [last] : []);
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await updateUserData({
      userId: user.id,
      userData: {
        name: name,
        roles: roles[0],
      },
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    onClose();
    // Call your update user API here
  };

  return (
    <>
      <Tooltip color="secondary" content="Edit user">
        <span className="text-lg text-secondary-400 cursor-pointer active:opacity-50">
          <Icon icon={"tabler:user-edit"} fontSize={22} onClick={onOpen} />
        </span>
      </Tooltip>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <Form onSubmit={submitHandler}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Update User
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Name"
                    placeholder="Enter name"
                    variant="bordered"
                    value={name}
                    onValueChange={setName}
                    isRequired
                  />
                  <Input
                    label="Email"
                    placeholder="Enter email"
                    variant="bordered"
                    type="email"
                    value={user.email}
                    isDisabled
                  />

                  <div className="flex flex-col gap-3 mt-3">
                    <CheckboxGroup
                      color="default"
                      label="Select User Roles"
                      value={roles}
                      onValueChange={handleRolesChange}
                    >
                      {userRoles.map((role) => (
                        <Checkbox key={role} value={role}>
                          {role}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" type="submit">
                    Update User
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Form>
      </Modal>
    </>
  );
}
