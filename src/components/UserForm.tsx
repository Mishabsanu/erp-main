import { FormikInput } from '@/components/shared/FormikInput';
import { FormikPhoneInput } from '@/components/shared/FormikPhoneInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/types';
import { FormikProvider, useFormik, useFormikContext } from 'formik';
import { Edit3, Eye, EyeOff, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import PasswordDrawer from './Modal/PasswordDrawer';

import { getRoleDropdown } from '@/services/roleApi';

const UserValidationSchema = (isEditMode: boolean) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .required('Full name is required'),

    email: Yup.string()
      .email('Enter a valid email')
      .required('Email address is required'),

    mobile: Yup.string()
      .matches(/^\+?[1-9]\d{6,14}$/, 'Enter a valid mobile number')
      .required('Mobile number is required'),

    password: isEditMode
      ? Yup.string().notRequired()
      : Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .max(30, 'Password cannot exceed 30 characters')
        .required('Password is required'),

    role: Yup.string().required('Select a role'),

    status: Yup.string()
      .oneOf(['active', 'inactive'])
      .required('Select a status'),
  });

interface UserFormProps {
  initialData?: User;
  onSubmit: (
    userData: Partial<User>,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
}) => {
  const { can } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDrawer, setShowPasswordDrawer] = useState(false);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoleDropdown();
        if (response.success && Array.isArray(response.data)) {
          setRoles(
            response.data.map((role: any) => ({
              value: role._id,
              label: role.name,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      mobile: initialData?.mobile || '',
      password: '',
      role:
        (initialData?.role && typeof initialData.role === 'object')
          ? (initialData.role as any)._id
          : (initialData?.role ?? ''),
      status: initialData?.status || 'active',
    },
    validationSchema: UserValidationSchema(isEditMode),

    onSubmit: async (values, { setSubmitting, setErrors }) => {
      const selectedRole = roles.find((r) => r.value === values.role);
      const roleId =
        selectedRole?.value ??
        (typeof initialData?.role === 'object'
          ? initialData.role._id
          : initialData?.role);

      const sanitized: Partial<User> = {
        _id: initialData?._id,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        mobile: values.mobile,
        password: values.password,
        role: roleId,
        status: values.status,
      };

      if (isEditMode && !sanitized.password) {
        delete sanitized.password;
      }

      await onSubmit(sanitized, { setErrors, setSubmitting });
    },
    enableReinitialize: true,
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="flex items-center justify-between mb-10 border-b border-gray-300 pb-5">
        <div className="flex items-center gap-3">
          {isEditMode && can('user', 'update') ? (
            <Edit3 className="text-[#0f766e] w-6 h-6" />
          ) : (
            <UserPlus className="text-[#0f766e] w-6 h-6" />
          )}

          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h2>
        </div>

        <span className="text-sm text-gray-500 italic">
          {isEditMode
            ? 'Modify existing user details'
            : 'Create a new team member'}
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormikInput
              label="Full Name"
              name="name"
              placeholder="Enter full name"
              required
            />
            <FormikInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter email address"
              required
            />
            <FormikPhoneInput
              label="Mobile Number"
              name="mobile"
              placeholder="Enter mobile number"
              required
            />

            <FormikSelect label="Role" name="role" options={roles} required />

            {isEditMode && initialData?.createdBy && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Created By
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600 font-medium">
                  {typeof initialData.createdBy === 'object' 
                    ? (initialData.createdBy as any).name 
                    : initialData.createdBy}
                </div>
              </div>
            )}

            {isEditMode && can('user', 'update') && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="tracking-widest text-gray-500">
                    **********
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasswordDrawer(true)}
                    className="text-sm font-semibold text-sky-600 hover:underline"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            {!isEditMode && (
              <div>
                <FormikInput
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  required
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-sm transition ${formik.isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0f766e] hover:bg-teal-800'
                }`}
            >
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>

      <PasswordDrawer
        open={showPasswordDrawer}
        onClose={() => setShowPasswordDrawer(false)}
        onSubmit={async (password: string) => {
          if (!initialData?._id) return;
          await onSubmit(
            {
              _id: initialData._id,
              password,
            },
            formik
          );
        }}
      />
    </div>
  );
};

export default UserForm;
