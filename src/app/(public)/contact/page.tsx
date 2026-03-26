import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import ContactForm from "@/components/contact/ContactForm";
import { getContactPageContent } from "@/lib/site-content.server";
import { HiMail, HiLocationMarker, HiPhone } from "react-icons/hi";

export default async function ContactPage() {
  const content = await getContactPageContent();
  const contactInfo = [
    {
      icon: <HiMail className="text-xl" />,
      label: content.email.label,
      value: content.email.value,
      href: content.email.value ? `mailto:${content.email.value}` : "",
    },
    {
      icon: <HiPhone className="text-xl" />,
      label: content.phone.label,
      value: content.phone.value,
      href: content.phone.value
        ? `tel:${content.phone.value.replace(/\s+/g, "")}`
        : "",
    },
    {
      icon: <HiLocationMarker className="text-xl" />,
      label: content.location.label,
      value: content.location.value,
      href: "",
    },
  ];

  return (
    <Section>
      <PageHeader
        title={content.header.title}
        description={content.header.description}
      />

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-4 sm:space-y-6">
          {contactInfo.map((info) => (
            <Card key={info.label} hover={false}>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]">
                  {info.icon}
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {info.label}
                  </p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="font-medium text-white transition-colors hover:text-[var(--color-primary-light)]"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="font-medium text-white">{info.value}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
