import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import toast from 'react-hot-toast';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email',
      value: 'support@eventhive.com',
      description: 'Send us an email anytime',
    },
    {
      icon: PhoneIcon,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 5pm',
    },
    {
      icon: MapPinIcon,
      title: 'Office',
      value: 'San Francisco, CA',
      description: '123 Event Street, Suite 100',
    },
    {
      icon: ClockIcon,
      title: 'Support Hours',
      value: '24/7 Online',
      description: 'We\'re here when you need us',
    },
  ];

  const faqs = [
    {
      question: 'How do I create an event?',
      answer: 'Simply sign up as an organizer, go to your dashboard, and click "Create Event". Our intuitive wizard will guide you through the process.',
    },
    {
      question: 'Is EventHive free to use?',
      answer: 'EventHive is free for basic event creation and management. We offer premium features for advanced analytics and customization.',
    },
    {
      question: 'How do I cancel my booking?',
      answer: 'You can cancel your booking from your dashboard under "My Bookings" section, subject to the event\'s cancellation policy.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'Refunds depend on the event organizer\'s policy. Please check the event details or contact the organizer directly.',
    },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-6 text-primary-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
              <Card.Header>
                <Card.Title className="text-white">Send us a message</Card.Title>
                <Card.Description className="text-gray-300">
                  Fill out the form below and we'll get back to you as soon as possible.
                </Card.Description>
              </Card.Header>
              
              <Card.Content>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Enter your first name"
                      required
                      error={errors.firstName?.message}
                      {...register('firstName', {
                        required: 'First name is required',
                      })}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter your last name"
                      required
                      error={errors.lastName?.message}
                      {...register('lastName', {
                        required: 'Last name is required',
                      })}
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Subject <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      {...register('subject', {
                        required: 'Please select a subject',
                      })}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="partnership">Partnership</option>
                    </select>
                    {errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Message <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      {...register('message', {
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message must be at least 10 characters',
                        },
                      })}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Send Message
                  </Button>
                </form>
              </Card.Content>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-blue-400 font-medium">{item.value}</p>
                      <p className="text-sm text-gray-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
                    <Card.Content className="p-6">
                      <h3 className="font-semibold text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Help */}
            <Card className="bg-primary-500/20 border border-primary-500/30 text-white">
              <Card.Content className="p-6 text-center">
                <h3 className="font-semibold text-white mb-2">
                  Need immediate help?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Check out our comprehensive help center with guides and tutorials.
                </p>
                <Button variant="primary" size="sm">
                  Visit Help Center
                </Button>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

