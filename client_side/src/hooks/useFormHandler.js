import { useState } from "react";

/**
 * Custom hook for handling form state and updates
 * @param {Object} initialValues - The initial values of the form fields
 * @returns {Object} - Form state, handler functions, and reset function
 */
const useFormHandler = (initialValues) => {
  const [formValues, setFormValues] = useState(initialValues);

  /**
   * Handles changes to form inputs
   * @param {Event} e - The input change event
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Resets the form to its initial values
   */
  const resetForm = () => {
    setFormValues(initialValues);
  };

  /**
   * Updates the form state manually
   * @param {Object} newValues - The new values to update the form state
   */
  const setFormState = (newValues) => {
    setFormValues((prev) => ({ ...prev, ...newValues }));
  };

  return {
    formValues,
    handleInputChange,
    resetForm,
    setFormState,
  };
};

export default useFormHandler;
