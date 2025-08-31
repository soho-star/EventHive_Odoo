import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import eventService from '../../services/eventService';
import uploadService from '../../services/uploadService';
import toast from 'react-hot-toast';
import FileUpload from '../../components/UI/FileUpload';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventPoster, setEventPoster] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({ poster: null, images: [] });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ticketTypes: [
        {
          typeName: 'General Admission',
          price: 0,
          maxPerUser: 1,
          maxTotal: 100
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log('🔍 Raw form data:', JSON.stringify(data, null, 2));

      // Validate dates
      const eventStart = new Date(data.eventStart);
      const eventEnd = new Date(data.eventEnd);
      const registrationStart = new Date(data.registrationStart);
      const registrationEnd = new Date(data.registrationEnd);

      if (eventStart >= eventEnd) {
        toast.error('Event end time must be after start time');
        return;
      }

      if (registrationStart >= registrationEnd) {
        toast.error('Registration end time must be after start time');
        return;
      }

      // Format the data for the API with proper type conversion
      const eventData = {
        name: String(data.name || '').trim(),
        description: String(data.description || '').trim(),
        category: String(data.category || ''),
        location: String(data.location || '').trim(),
        eventStart: eventStart.toISOString(),
        eventEnd: eventEnd.toISOString(),
        registrationStart: registrationStart.toISOString(),
        registrationEnd: registrationEnd.toISOString(),
        ticketTypes: (data.ticketTypes || []).map(ticket => ({
          typeName: String(ticket.typeName || '').trim(),
          price: Number(ticket.price) || 0,
          maxPerUser: Number(ticket.maxPerUser) || 1,
          maxTotal: Number(ticket.maxTotal) || 1
        }))
      };

      // Validate required fields
      if (!eventData.name || eventData.name.length < 3) {
        toast.error('Event name must be at least 3 characters');
        return;
      }

      if (!eventData.category) {
        toast.error('Please select a category');
        return;
      }

      if (!eventData.location || eventData.location.length < 5) {
        toast.error('Location must be at least 5 characters');
        return;
      }

      if (!eventData.ticketTypes.length) {
        toast.error('At least one ticket type is required');
        return;
      }

      // Validate ticket types
      for (let i = 0; i < eventData.ticketTypes.length; i++) {
        const ticket = eventData.ticketTypes[i];
        if (!ticket.typeName || ticket.typeName.length < 1) {
          toast.error(`Ticket type ${i + 1} name is required`);
          return;
        }
        if (ticket.maxTotal < 1) {
          toast.error(`Ticket type ${i + 1} must have at least 1 available ticket`);
          return;
        }
      }

      // Upload files if selected
      let posterUrl = null;
      let additionalImageUrls = [];

      try {
        // Upload event poster if selected
        if (eventPoster.length > 0) {
          posterUrl = await handleFileUpload(eventPoster, 'poster');
        }

        // Upload additional images if selected
        if (additionalImages.length > 0) {
          additionalImageUrls = await handleFileUpload(additionalImages, 'images');
        }
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return; // Stop execution if upload fails
      }

      // Add file URLs to event data
      if (posterUrl) {
        eventData.posterUrl = posterUrl;
        console.log('📸 Added poster URL:', posterUrl);
      }
      if (additionalImageUrls.length > 0) {
        eventData.additionalImages = additionalImageUrls;
        console.log('📸 Added additional image URLs:', additionalImageUrls);
      }

      console.log('📤 Sending event data:', JSON.stringify(eventData, null, 2));
      
      const response = await eventService.createEvent(eventData);
      
      toast.success('Event created successfully!');
      navigate('/organizer/events');
    } catch (error) {
      console.error('❌ Error creating event:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => 
          `${err.field}: ${err.message}`
        ).join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create event. Please check all fields and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTicketType = () => {
    append({
      typeName: '',
      price: 0,
      maxPerUser: 1,
      maxTotal: 100
    });
  };

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'music', label: 'Music' },
    { value: 'business', label: 'Business' },
    { value: 'sports', label: 'Sports' },
    { value: 'art', label: 'Art & Culture' },
    { value: 'education', label: 'Education' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileError = (error) => {
    toast.error(error);
  };

  const clearUploadedFiles = () => {
    setEventPoster([]);
    setAdditionalImages([]);
    setUploadedFiles({ poster: null, images: [] });
  };

  const handleFileUpload = async (files, type) => {
    try {
      if (type === 'poster') {
        if (files.length === 0) return null;
        
        toast.loading('Uploading event poster...');
        const response = await uploadService.uploadEventPoster(files[0]);
        console.log('📤 Poster upload response:', response);
        toast.dismiss();
        toast.success('Event poster uploaded successfully!');
        setUploadedFiles(prev => ({ ...prev, poster: response.data }));
        return response.data.url;
      } else if (type === 'images') {
        if (files.length === 0) return [];
        
        toast.loading(`Uploading ${files.length} additional images...`);
        const response = await uploadService.uploadEventImages(files);
        console.log('📤 Images upload response:', response);
        toast.dismiss();
        toast.success(`${files.length} additional images uploaded successfully!`);
        setUploadedFiles(prev => ({ ...prev, images: response.data.files }));
        return response.data.files.map(file => file.url);
      }
    } catch (error) {
      toast.dismiss();
      console.error(`❌ ${type} upload error:`, error);
      
      if (error.response?.data?.message) {
        toast.error(`Upload failed: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error(`Failed to upload ${type}. Please try again.`);
      }
      throw error;
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Event</h1>
          <p className="mt-2 text-gray-300">Fill in the details to create your event</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Header>
              <Card.Title className="text-white">Basic Information</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Event Name"
                    placeholder="Enter event name"
                    error={errors.name?.message}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                    {...register('name', {
                      required: 'Event name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('category', { required: 'Category is required' })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Location"
                    placeholder="Event venue or address"
                    error={errors.location?.message}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                    {...register('location', {
                      required: 'Location is required',
                      minLength: { value: 5, message: 'Location must be at least 5 characters' }
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your event..."
                    {...register('description')}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Date & Time */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Header>
              <Card.Title className="text-white">Date & Time</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Event Start"
                    type="datetime-local"
                    error={errors.eventStart?.message}
                    className="bg-gray-700 border-gray-600 text-white focus:border-primary-500"
                    {...register('eventStart', { required: 'Event start time is required' })}
                  />
                </div>

                <div>
                  <Input
                    label="Event End"
                    type="datetime-local"
                    error={errors.eventEnd?.message}
                    className="bg-gray-700 border-gray-600 text-white focus:border-primary-500"
                    {...register('eventEnd', { required: 'Event end time is required' })}
                  />
                </div>

                <div>
                  <Input
                    label="Registration Start"
                    type="datetime-local"
                    error={errors.registrationStart?.message}
                    className="bg-gray-700 border-gray-600 text-white focus:border-primary-500"
                    {...register('registrationStart', { required: 'Registration start time is required' })}
                  />
                </div>

                <div>
                  <Input
                    label="Registration End"
                    type="datetime-local"
                    error={errors.registrationEnd?.message}
                    className="bg-gray-700 border-gray-600 text-white focus:border-primary-500"
                    {...register('registrationEnd', { required: 'Registration end time is required' })}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Ticket Types */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="text-white">Ticket Types</Card.Title>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTicketType}
                  className="flex items-center gap-2 border-gray-600 bg-transparent text-white hover:bg-gray-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Ticket Type
                </Button>
              </div>
            </Card.Header>
            <Card.Content className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-600 bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-white">
                      Ticket Type {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Input
                        label="Ticket Name"
                        placeholder="e.g., General Admission"
                        error={errors.ticketTypes?.[index]?.typeName?.message}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                        {...register(`ticketTypes.${index}.typeName`, {
                          required: 'Ticket name is required'
                        })}
                      />
                    </div>

                    <div>
                      <Input
                        label="Price ($)"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.ticketTypes?.[index]?.price?.message}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                        {...register(`ticketTypes.${index}.price`, {
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be non-negative' }
                        })}
                      />
                    </div>

                    <div>
                      <Input
                        label="Max per User"
                        type="number"
                        min="1"
                        placeholder="1"
                        error={errors.ticketTypes?.[index]?.maxPerUser?.message}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                        {...register(`ticketTypes.${index}.maxPerUser`, {
                          required: 'Max per user is required',
                          min: { value: 1, message: 'Must be at least 1' }
                        })}
                      />
                    </div>

                    <div>
                      <Input
                        label="Total Available"
                        type="number"
                        min="1"
                        placeholder="100"
                        error={errors.ticketTypes?.[index]?.maxTotal?.message}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                        {...register(`ticketTypes.${index}.maxTotal`, {
                          required: 'Total available is required',
                          min: { value: 1, message: 'Must be at least 1' }
                        })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>

          {/* Event Images */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Header>
              <Card.Title className="text-white">Event Images</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              {/* Event Poster */}
              <div>
                <FileUpload
                  label="Event Poster (Main Image)"
                  accept="image/*"
                  multiple={false}
                  maxFiles={1}
                  value={eventPoster}
                  onChange={setEventPoster}
                  onError={handleFileError}
                  placeholder="Upload a main poster image for your event"
                  className="text-white"
                />
                <p className="mt-2 text-sm text-gray-400">
                  This will be the main image displayed for your event. Recommended size: 1200x800 pixels.
                </p>
              </div>

              {/* Additional Images */}
              <div>
                <FileUpload
                  label="Additional Images (Optional)"
                  accept="image/*"
                  multiple={true}
                  maxFiles={5}
                  value={additionalImages}
                  onChange={setAdditionalImages}
                  onError={handleFileError}
                  placeholder="Upload additional images to showcase your event"
                  className="text-white"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Add up to 5 additional images to give attendees a better understanding of your event.
                </p>
              </div>

              {/* Uploaded Files Preview */}
              {(uploadedFiles.poster || uploadedFiles.images.length > 0) && (
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <h4 className="text-sm font-medium text-white mb-3">Uploaded Files</h4>
                  
                  {uploadedFiles.poster && (
                    <div className="mb-3 p-3 bg-green-900/20 border border-green-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Event Poster</p>
                          <p className="text-xs text-green-400">Successfully uploaded</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {uploadedFiles.images.length > 0 && (
                    <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{uploadedFiles.images.length} Additional Images</p>
                          <p className="text-xs text-blue-400">Successfully uploaded</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={clearUploadedFiles}
                disabled={eventPoster.length === 0 && additionalImages.length === 0}
                className="border-gray-600 bg-transparent text-white hover:bg-gray-700"
              >
                Clear Files
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/organizer/events')}
                className="border-gray-600 bg-transparent text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Event
            </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

