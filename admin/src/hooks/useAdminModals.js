import { useState } from 'react';

/**
 * All modal visibility toggles, editing targets, and confirmation dialog.
 */
export default function useAdminModals() {
  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Subcategory modal
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCatForSubcat, setSelectedCatForSubcat] = useState(null);

  // Collection modal
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  // Other modals
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showDiscountTypeModal, setShowDiscountTypeModal] = useState(false);
  const [selectedDiscountType, setSelectedDiscountType] = useState({ id: 'amount_off_order', name: 'Amount Off Order' });
  const [discountMethod, setDiscountMethod] = useState('CODE');

  // Variants modal
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Browse picker
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseTargetType, setBrowseTargetType] = useState('products');
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');
  const [browseTargetField, setBrowseTargetField] = useState('applies_to');
  const [discountSelections, setDiscountSelections] = useState({
    applies_to: [],
    buys: [],
    gets: [],
    customers: []
  });
  const [eligibilityType, setEligibilityType] = useState('all');
  const [limitTotalUses, setLimitTotalUses] = useState(false);
  const [limitTotalUsesVal, setLimitTotalUsesVal] = useState(100);
  const [limitOnePerCustomer, setLimitOnePerCustomer] = useState(true);

  // Order details
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderNoteInput, setOrderNoteInput] = useState('');
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [adminOrderStatusInput, setAdminOrderStatusInput] = useState('PROCESSING');
  const [adminCancelReasonInput, setAdminCancelReasonInput] = useState('');

  // Media
  const [previewMediaItem, setPreviewMediaItem] = useState(null);
  const [showProductMediaPickerModal, setShowProductMediaPickerModal] = useState(false);

  // Deletion confirms
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // Page modal
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  // User dossier
  const [selectedUserDossier, setSelectedUserDossier] = useState(null);
  const [loadingUserDossier, setLoadingUserDossier] = useState(false);

  // Generic confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
    onConfirm: null
  });

  const askConfirmation = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      danger,
      onConfirm
    });
  };

  return {
    // Product
    showProductModal, setShowProductModal,
    editingProduct, setEditingProduct,
    // Category
    showCategoryModal, setShowCategoryModal,
    editingCategory, setEditingCategory,
    // Subcategory
    showSubcategoryModal, setShowSubcategoryModal,
    selectedCatForSubcat, setSelectedCatForSubcat,
    // Collection
    showCollectionModal, setShowCollectionModal,
    editingCollection, setEditingCollection,
    // Other modals
    showBannerModal, setShowBannerModal,
    showCouponModal, setShowCouponModal,
    showDiscountTypeModal, setShowDiscountTypeModal,
    selectedDiscountType, setSelectedDiscountType,
    discountMethod, setDiscountMethod,
    // Variants
    selectedProductForVariants, setSelectedProductForVariants,
    // Mobile
    isMobileMenuOpen, setIsMobileMenuOpen,
    // Browse picker
    showBrowseModal, setShowBrowseModal,
    browseTargetType, setBrowseTargetType,
    browseSearchQuery, setBrowseSearchQuery,
    browseTargetField, setBrowseTargetField,
    discountSelections, setDiscountSelections,
    eligibilityType, setEligibilityType,
    limitTotalUses, setLimitTotalUses,
    limitTotalUsesVal, setLimitTotalUsesVal,
    limitOnePerCustomer, setLimitOnePerCustomer,
    // Order details
    selectedOrderDetails, setSelectedOrderDetails,
    orderNoteInput, setOrderNoteInput,
    courierInput, setCourierInput,
    trackingInput, setTrackingInput,
    adminOrderStatusInput, setAdminOrderStatusInput,
    adminCancelReasonInput, setAdminCancelReasonInput,
    // Media
    previewMediaItem, setPreviewMediaItem,
    showProductMediaPickerModal, setShowProductMediaPickerModal,
    // Deletion
    deleteConfirmProduct, setDeleteConfirmProduct,
    deletingProductId, setDeletingProductId,
    deleteConfirmCategory, setDeleteConfirmCategory,
    deletingCategoryId, setDeletingCategoryId,
    // Page
    showPageModal, setShowPageModal,
    editingPage, setEditingPage,
    // User dossier
    selectedUserDossier, setSelectedUserDossier,
    loadingUserDossier, setLoadingUserDossier,
    // Confirmation
    confirmModal, setConfirmModal,
    askConfirmation
  };
}
