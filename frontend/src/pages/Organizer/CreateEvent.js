import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Format the data for the API
      const eventData = {
        ...data,
        eventStart: new Date(data.eventStart).toISOString(),
        eventEnd: new Date(data.eventEnd).toISOString(),
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        ticketTypes: data.ticketTypes.map(ticket => ({
          ...ticket,
          price: parseFloat(ticket.price) || 0,
          maxPerUser: parseInt(ticket.maxPerUser) || 1,
          maxTotal: parseInt(ticket.maxTotal) || 1
        }))
      };

      console.log('📤 Sending event data:', JSON.stringify(eventData, null, 2));
      
      const response = await eventService.createEvent(eventData);
      
      toast.success('Event created successfully!');
      navigate('/organizer/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-2 text-gray-600">Fill in the details to create your event</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <Card.Header>
              <Card.Title>Basic Information</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Event Name"
                    placeholder="Enter event name"
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'Event name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Location"
                    placeholder="Event venue or address"
                    error={errors.location?.message}
                    {...register('location', {
                      required: 'Location is required',
                      minLength: { value: 5, message: 'Location must be at least 5 characters' }
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your event..."
                    {...register('description')}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Date & Time */}
          <Card>
            <Card.Header>
              <Card.Title>Date & Time</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Event Start"
                    type="datetime-local"
                    error={errors.eventStart?.message}
                    {...register('eventStart', { required: 'Event start time is required' })}
                  />
                </div>

                <div>
                  <Input
                    label="Event End"
                    type="datetime-local"
                    error={errors.eventEnd?.message}
                    {...register('eventEnd', { required: 'Event end time is required' })}
                  />
                </div>

                <div>
                  <Input
                    label="Registration Start"
                    type="datetime-local"
                    error={errors.registrationStart?.message}
                    {...register('registrationStart', { required: 'Registration start time is required' })}
                  />
                </div>

                <div>
                  <Input
                    label="Registration End"
                    type="datetime-local"
                    error={errors.registrationEnd?.message}
                    {...register('registrationEnd', { required: 'Registration end time is required' })}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Ticket Types */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Ticket Types</Card.Title>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTicketType}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Ticket Type
                </Button>
              </div>
            </Card.Header>
            <Card.Content className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Ticket Type {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
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

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/organizer/events')}
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
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

