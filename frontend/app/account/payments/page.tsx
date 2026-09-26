"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Smartphone,
  Building2,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import paymentMethodsService, { 
  type PaymentMethod, 
  type CreatePaymentMethodInput 
} from "@/lib/api-services/payment-methods";
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

const PAYMENT_PROVIDERS = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'vodafone', label: 'Vodafone Cash' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bank', label: 'Bank Transfer' }
];

const PAYMENT_METHOD_TYPES = [
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' }
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; methodId: string | null; label: string }>({
    show: false,
    methodId: null,
    label: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState<CreatePaymentMethodInput>({
    provider: '',
    method_type: '',
    label: '',
    account_name: '',
    account_number: '',
    phone_number: '',
    card_last_four: '',
    card_brand: '',
    card_exp_month: undefined,
    card_exp_year: undefined,
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

        // Load payment methods from API
        try {
          const loadedMethods = await paymentMethodsService.getPaymentMethods();
          setPaymentMethods(loadedMethods);
        } catch (error) {
          console.error('Failed to load payment methods:', error);
          setErrorMessage('Failed to load payment methods. Please try again.');
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

    if (!formData.provider || !formData.provider.toString().trim()) errors.provider = 'Provider is required';
    if (!formData.method_type || !formData.method_type.toString().trim()) errors.method_type = 'Method type is required';
    if (!formData.account_name || !formData.account_name.toString().trim()) errors.account_name = 'Account name is required';
    if (!formData.account_number || !formData.account_number.toString().trim()) errors.account_number = 'Account number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingId(method.id);
      setFormData({
        provider: method.provider,
        method_type: method.method_type,
        account_name: method.account_name,
        account_number: method.account_number,
        phone_number: method.phone_number || '',
        card_last_four: method.card_last_four || '',
        card_brand: method.card_brand || '',
        card_exp_month: method.card_exp_month,
        card_exp_year: method.card_exp_year,
        is_default: method.is_default
      });
    } else {
      setEditingId(null);
      setFormData({
        provider: '',
        method_type: '',
        account_name: userProfile?.full_name || '',
        account_number: '',
        phone_number: userProfile?.phone || '',
        card_last_four: '',
        card_brand: '',
        card_exp_month: undefined,
        card_exp_year: undefined,
        is_default: paymentMethods.length === 0
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
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseInt(value) : undefined) : value)
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
      // Auto-generate label from selected provider
      const selectedProvider = PAYMENT_PROVIDERS.find(p => p.value === formData.provider);
      const label = selectedProvider?.label || formData.provider;

      const dataToSubmit = {
        ...formData,
        label
      };

      if (editingId) {
        // Update payment method
        await paymentMethodsService.updatePaymentMethod(editingId, dataToSubmit);
        setSuccessMessage('Payment method updated successfully!');
        
        // Refresh payment methods
        const updatedMethods = await paymentMethodsService.getPaymentMethods();
        setPaymentMethods(updatedMethods);
      } else {
        // Create new payment method
        await paymentMethodsService.createPaymentMethod(dataToSubmit);
        setSuccessMessage('Payment method added successfully!');
        
        // Refresh payment methods
        const updatedMethods = await paymentMethodsService.getPaymentMethods();
        setPaymentMethods(updatedMethods);
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
      console.error('Error saving payment method:', error);
      setErrorMessage(error.message || 'Failed to save payment method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (methodId: string, label: string) => {
    setDeleteConfirm({ show: true, methodId, label });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.methodId) return;

    setIsDeleting(true);
    try {
      await paymentMethodsService.deletePaymentMethod(deleteConfirm.methodId);
      setSuccessMessage('Payment method deleted successfully!');
      
      // Refresh payment methods
      const updatedMethods = await paymentMethodsService.getPaymentMethods();
      setPaymentMethods(updatedMethods);

      setDeleteConfirm({ show: false, methodId: null, label: '' });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      setErrorMessage(error.message || 'Failed to delete payment method. Please try again.');
      setDeleteConfirm({ show: false, methodId: null, label: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, methodId: null, label: '' });
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await paymentMethodsService.setDefaultPaymentMethod(methodId);
      setSuccessMessage('Default payment method updated!');
      
      // Refresh payment methods
      const updatedMethods = await paymentMethodsService.getPaymentMethods();
      setPaymentMethods(updatedMethods);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      setErrorMessage(error.message || 'Failed to set default payment method. Please try again.');
    }
  };

  const getPaymentMethodIcon = (provider: string) => {
    if (provider.includes('card')) return <CreditCard className="h-8 w-8" />;
    if (provider.includes('bank')) return <Building2 className="h-8 w-8" />;
    return <Smartphone className="h-8 w-8" />;
  };

  const getMaskedAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return `•••• •••• •••• ${accountNumber.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading payment methods...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600 mt-1">
              Manage your payment methods for faster and secure checkout
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Your payment information is secure</p>
          <p className="text-sm text-blue-800 mt-1">We use industry-standard encryption to protect your payment data and never store sensitive card information.</p>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No payment methods yet</p>
            <p className="text-sm text-gray-500 mt-1">Add a payment method to get started</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-gray-400">
                    {getPaymentMethodIcon(method.provider)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{method.label}</h3>
                      {method.is_default && (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getMaskedAccountNumber(method.account_number)} • {method.account_name}
                    </p>
                    {method.card_last_four && (
                      <p className="text-sm text-gray-500">
                        {method.card_brand?.toUpperCase()} ending in {method.card_last_four}
                        {method.card_exp_month && method.card_exp_year && (
                          <span> • Expires {String(method.card_exp_month).padStart(2, '0')}/{method.card_exp_year}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(method)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    title="Edit payment method"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id, method.label)}
                    disabled={method.is_default}
                    className={`transition ${
                      method.is_default
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    title={method.is_default ? "Cannot delete the default payment method" : "Delete payment method"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleOpenModal(method)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition"
                >
                  Edit
                </button>
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Method Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
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
              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.provider ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                >
                  <option value="">Select a provider</option>
                  {PAYMENT_PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
                {formErrors.provider && <p className="text-red-500 text-xs mt-1">{formErrors.provider}</p>}
              </div>

              {/* Method Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method Type
                </label>
                <select
                  name="method_type"
                  value={formData.method_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.method_type ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                >
                  <option value="">Select method type</option>
                  {PAYMENT_METHOD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.method_type && <p className="text-red-500 text-xs mt-1">{formErrors.method_type}</p>}
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name / Cardholder Name
                </label>
                <input
                  type="text"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.account_name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="Full name"
                />
                {formErrors.account_name && <p className="text-red-500 text-xs mt-1">{formErrors.account_name}</p>}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number / Phone Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.account_number ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="Account or phone number"
                />
                {formErrors.account_number && <p className="text-red-500 text-xs mt-1">{formErrors.account_number}</p>}
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="+233 24 000 0000"
                />
              </div>

              {/* Card Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Brand (Optional)
                  </label>
                  <select
                    name="card_brand"
                    value={formData.card_brand || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="amex">American Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    name="card_last_four"
                    value={formData.card_last_four || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="card_exp_month"
                      value={formData.card_exp_month || ''}
                      onChange={handleInputChange}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="MM"
                      min="1"
                      max="12"
                    />
                    <input
                      type="number"
                      name="card_exp_year"
                      value={formData.card_exp_year || ''}
                      onChange={handleInputChange}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="YY"
                      min="24"
                      max="99"
                    />
                  </div>
                </div>
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
                  Set as default payment method
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
                  {isSubmitting ? 'Saving...' : 'Save Payment Method'}
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
                  <h3 className="text-lg font-bold text-gray-900">Delete Payment Method</h3>
                  <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this payment method?
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
                    Delete Payment Method
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
