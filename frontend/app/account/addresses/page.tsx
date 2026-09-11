"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import addressesService, { type Address, type CreateAddressInput } from "@/lib/api-services/addresses";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type FormErrors = {
  [key: string]: string;
};

export default function AddressesPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; addressId: string | null; label: string }>({
    show: false,
    addressId: null,
    label: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState<CreateAddressInput>({
    label: '',
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    postal_code: '',
    country: 'Ghana',
    delivery_instructions: '',
    is_default: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (!sessionUser) {
          router.replace("/auth/login");
          return;
        }

        const email = sessionUser.email?.trim().toLowerCase();
        if (email && isKnownAdminEmail(email)) {
          const { data: adminUser } = await supabase
            .from("admin_users")
            .select("id")
            .ilike("email", email)
            .maybeSingle();

          if (adminUser || isKnownAdminEmail(email)) {
            router.replace("/admin/dashboard");
            return;
          }
        }

        // Set user profile
        const profile: UserProfile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
          phone: sessionUser.user_metadata?.phone || '',
          avatar_url: sessionUser.user_metadata?.avatar_url || null,
          created_at: sessionUser.created_at || new Date().toISOString()
        };

        setUserProfile(profile);

        // Load addresses from API
        try {
          const loadedAddresses = await addressesService.getAddresses();
          setAddresses(loadedAddresses);
        } catch (error) {
          console.error('Failed to load addresses:', error);
          setErrorMessage('Failed to load addresses. Please try again.');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.label || !formData.label.toString().trim()) errors.label = 'Label is required';
    if (!formData.full_name || !formData.full_name.toString().trim()) errors.full_name = 'Full name is required';
    if (!formData.phone || !formData.phone.toString().trim()) errors.phone = 'Phone is required';
    if (!formData.address || !formData.address.toString().trim()) errors.address = 'Address is required';
    if (!formData.city || !formData.city.toString().trim()) errors.city = 'City is required';
    if (!formData.country || !formData.country.toString().trim()) errors.country = 'Country is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        label: address.label,
        full_name: address.full_name,
        phone: address.phone,
        email: address.email || '',
        address: address.address,
        city: address.city,
        region: address.region || '',
        postal_code: address.postal_code || '',
        country: address.country || 'Ghana',
        delivery_instructions: address.delivery_instructions || '',
        is_default: address.is_default
      });
    } else {
      setEditingId(null);
      setFormData({
        label: '',
        full_name: userProfile?.full_name || '',
        phone: userProfile?.phone || '',
        email: userProfile?.email || '',
        address: '',
        city: '',
        region: '',
        postal_code: '',
        country: 'Ghana',
        delivery_instructions: '',
        is_default: addresses.length === 0
      });
    }
    setFormErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingId) {
        // Update address
        await addressesService.updateAddress(editingId, formData);
        setSuccessMessage('Address updated successfully!');
        
        // Refresh addresses
        const updatedAddresses = await addressesService.getAddresses();
        setAddresses(updatedAddresses);
      } else {
        // Create new address
        await addressesService.createAddress(formData);
        setSuccessMessage('Address added successfully!');
        
        // Refresh addresses
        const updatedAddresses = await addressesService.getAddresses();
        setAddresses(updatedAddresses);
      }

      // Auto-close modal after 1.5 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 1500);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error saving address:', error);
      setErrorMessage(error.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string, label: string) => {
    setDeleteConfirm({ show: true, addressId, label });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.addressId) return;

    setIsDeleting(true);
    try {
      await addressesService.deleteAddress(deleteConfirm.addressId);
      setSuccessMessage('Address deleted successfully!');
      
      // Refresh addresses
      const updatedAddresses = await addressesService.getAddresses();
      setAddresses(updatedAddresses);

      setDeleteConfirm({ show: false, addressId: null, label: '' });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting address:', error);
      setErrorMessage(error.message || 'Failed to delete address. Please try again.');
      setDeleteConfirm({ show: false, addressId: null, label: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, addressId: null, label: '' });
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressesService.setDefaultAddress(addressId);
      setSuccessMessage('Default address updated!');
      
      // Refresh addresses
      const updatedAddresses = await addressesService.getAddresses();
      setAddresses(updatedAddresses);

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error: any) {
      console.error('Error setting default address:', error);
      setErrorMessage(error.message || 'Failed to set default address. Please try again.');
    }
  }

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading addresses...</p>
        </div>
      </AccountLayout>
    );
  }

  if (!userProfile) {
    router.push('/auth/login');
    return null;
  }

  return (
    <AccountLayout>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Addresses</h1>
            <p className="text-gray-600 mt-1">
              Manage your delivery addresses for faster checkout
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          You must have at least one default address. To delete your default address, please set another address as default first.
        </p>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Home className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">{address.label}</span>
                {address.is_default && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(address)}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Edit address"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(address.id, address.label)}
                  disabled={address.is_default}
                  className={`transition ${
                    address.is_default
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-400 hover:text-red-600'
                  }`}
                  title={address.is_default ? "Cannot delete the default address" : "Delete address"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{address.full_name}</p>
              <p>{address.phone}</p>
              <p>{address.address}</p>
              <p>{address.city}{address.region ? `, ${address.region}` : ''}</p>
              {address.postal_code && <p>{address.postal_code}</p>}
              {address.country && <p>{address.country}</p>}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleOpenModal(address)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition"
              >
                Edit
              </button>
              {!address.is_default && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add New Address Card */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-orange-300 hover:bg-orange-50 transition text-center"
        >
          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Add New Address</p>
          <p className="text-xs text-gray-500 mt-1">Create a new delivery address</p>
        </button>
      </div>

      {/* Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (e.g., Home, Office)
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.label ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="e.g., Home"
                />
                {formErrors.label && <p className="text-red-500 text-xs mt-1">{formErrors.label}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.full_name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="Full name"
                />
                {formErrors.full_name && <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="+233 24 000 0000"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="email@example.com"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="Street address"
                />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              {/* City & Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                    placeholder="City"
                  />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region (Optional)
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Region/State"
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      formErrors.country ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                    placeholder="Country"
                  />
                  {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="delivery_instructions"
                  value={formData.delivery_instructions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g., Please leave at gate"
                  rows={3}
                />
              </div>

              {/* Set as Default */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-50 border-b border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Address</h3>
                  <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this address?
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 border border-gray-200">
                <span className="font-medium text-gray-900">{deleteConfirm.label}</span>
              </p>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}