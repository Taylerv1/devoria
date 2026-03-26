"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import ImageUpload from "@/components/admin/ImageUpload";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { getDocument, setDocument } from "@/firebase/firestore";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  ABOUT_VALUE_ICON_OPTIONS,
  EMPTY_ABOUT_VALUE,
  EMPTY_HOME_STAT,
  EMPTY_TEAM_MEMBER,
  SITE_CONTENT_COLLECTION,
  SITE_CONTENT_DOCS,
  AboutPageContent,
  AboutValueItem,
  ContactInfoField,
  ContactPageContent,
  HomePageContent,
  HomeStat,
  TeamMember,
  createDefaultAboutPageContent,
  createDefaultContactPageContent,
  createDefaultHomePageContent,
  normalizeAboutPageContent,
  normalizeContactPageContent,
  normalizeHomePageContent,
} from "@/lib/site-content";
import { HiCheck, HiChevronDown, HiChevronUp, HiPlus, HiTrash, HiLockClosed } from "react-icons/hi";

type NoticeState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  [nextItems[index], nextItems[nextIndex]] = [
    nextItems[nextIndex],
    nextItems[index],
  ];

  return nextItems;
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark)]/60 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ArrayItemCard({
  title,
  index,
  count,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
  readOnly,
}: {
  title: string;
  index: number;
  count: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            {title} {index + 1}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Position {index + 1} of {count}
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-dark-border)] px-3 py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiChevronUp />
              Up
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === count - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-dark-border)] px-3 py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiChevronDown />
              Down
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
            >
              <HiTrash />
              Remove
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <AdminGuard requiredPermission={{ resource: "content" }} unauthorizedMode="not-found">
      <AdminContentManager />
    </AdminGuard>
  );
}

function AdminContentManager() {
  const access = useAdminAccess();
  const canUpdate = access.can("content", "update");
  const [homeContent, setHomeContent] = useState<HomePageContent>(
    createDefaultHomePageContent()
  );
  const [aboutContent, setAboutContent] = useState<AboutPageContent>(
    createDefaultAboutPageContent()
  );
  const [contactContent, setContactContent] = useState<ContactPageContent>(
    createDefaultContactPageContent()
  );
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [savingHome, setSavingHome] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPageContent() {
      try {
        const [homeDoc, aboutDoc, contactDoc] = await Promise.all([
          getDocument(SITE_CONTENT_COLLECTION, SITE_CONTENT_DOCS.home),
          getDocument(SITE_CONTENT_COLLECTION, SITE_CONTENT_DOCS.about),
          getDocument(SITE_CONTENT_COLLECTION, SITE_CONTENT_DOCS.contact),
        ]);

        if (!active) {
          return;
        }

        setHomeContent(normalizeHomePageContent(homeDoc));
        setAboutContent(normalizeAboutPageContent(aboutDoc));
        setContactContent(normalizeContactPageContent(contactDoc));
      } catch (error) {
        console.error("[admin-content] Failed to load managed pages:", error);

        if (!active) {
          return;
        }

        setHomeContent(createDefaultHomePageContent());
        setAboutContent(createDefaultAboutPageContent());
        setContactContent(createDefaultContactPageContent());
        setNotice({
          tone: "error",
          message:
            "Failed to load saved page content. Default content is shown so you can keep editing.",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPageContent();

    return () => {
      active = false;
    };
  }, []);

  function updateHomeStat(index: number, field: keyof HomeStat, value: string) {
    setHomeContent((current) => ({
      ...current,
      stats: current.stats.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateAboutValue(
    index: number,
    field: keyof AboutValueItem,
    value: string
  ) {
    setAboutContent((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateTeamMember(
    index: number,
    field: keyof TeamMember,
    value: string
  ) {
    setAboutContent((current) => ({
      ...current,
      teamMembers: current.teamMembers.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateContactField(
    field: "email" | "phone" | "location",
    property: keyof ContactInfoField,
    value: string
  ) {
    setContactContent((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [property]: value,
      },
    }));
  }

  async function handleHomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate) return;
    setSavingHome(true);
    setNotice(null);

    try {
      await setDocument(
        SITE_CONTENT_COLLECTION,
        SITE_CONTENT_DOCS.home,
        homeContent
      );
      setNotice({
        tone: "success",
        message: "Home page content saved successfully.",
      });
    } catch (error) {
      console.error("[admin-content] Failed to save home content:", error);
      setNotice({
        tone: "error",
        message: "Failed to save home page content. Please try again.",
      });
    } finally {
      setSavingHome(false);
    }
  }

  async function handleAboutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate) return;
    setSavingAbout(true);
    setNotice(null);

    try {
      await setDocument(
        SITE_CONTENT_COLLECTION,
        SITE_CONTENT_DOCS.about,
        aboutContent
      );
      setNotice({
        tone: "success",
        message: "About page content saved successfully.",
      });
    } catch (error) {
      console.error("[admin-content] Failed to save about content:", error);
      setNotice({
        tone: "error",
        message: "Failed to save about page content. Please try again.",
      });
    } finally {
      setSavingAbout(false);
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate) return;
    setSavingContact(true);
    setNotice(null);

    try {
      await setDocument(
        SITE_CONTENT_COLLECTION,
        SITE_CONTENT_DOCS.contact,
        contactContent
      );
      setNotice({
        tone: "success",
        message: "Contact and footer content saved successfully.",
      });
    } catch (error) {
      console.error("[admin-content] Failed to save contact content:", error);
      setNotice({
        tone: "error",
        message: "Failed to save contact and footer content. Please try again.",
      });
    } finally {
      setSavingContact(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">

      {notice ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/20 bg-red-500/10 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.tone === "success" ? <HiCheck className="text-base" /> : null}
            <span>{notice.message}</span>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleHomeSubmit}>
        <Card hover={false} className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-[var(--color-dark-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
                Home
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Homepage Content
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Hero copy, stats, section intros, and the closing CTA.
              </p>
            </div>
            <Button type="submit" disabled={savingHome || !canUpdate}>
              {savingHome ? "Saving..." : "Save Home Page"}
            </Button>
          </div>

          <SectionBlock
            title="Hero Section"
            description="Main headline, intro text, and hero call-to-action buttons."
          >
            <Input
              label="Badge"
              value={homeContent.hero.badge}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, badge: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <Input
                label="Title Start"
                value={homeContent.hero.titleStart}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    hero: { ...current.hero, titleStart: event.target.value },
                  }))
                }
                readOnly={!canUpdate}
              />
              <Input
                label="Highlighted Title"
                value={homeContent.hero.titleHighlight}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    hero: {
                      ...current.hero,
                      titleHighlight: event.target.value,
                    },
                  }))
                }
                readOnly={!canUpdate}
              />
              <Input
                label="Title End"
                value={homeContent.hero.titleEnd}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    hero: { ...current.hero, titleEnd: event.target.value },
                  }))
                }
                readOnly={!canUpdate}
              />
            </div>
            <Textarea
              label="Description"
              value={homeContent.hero.description}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, description: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-4">
                <Input
                  label="Primary Button Label"
                  value={homeContent.hero.primaryButtonLabel}
                  onChange={(event) =>
                    setHomeContent((current) => ({
                      ...current,
                      hero: {
                        ...current.hero,
                        primaryButtonLabel: event.target.value,
                      },
                    }))
                  }
                  readOnly={!canUpdate}
                />
                <Input
                  label="Primary Button Link"
                  value={homeContent.hero.primaryButtonHref}
                  onChange={(event) =>
                    setHomeContent((current) => ({
                      ...current,
                      hero: {
                        ...current.hero,
                        primaryButtonHref: event.target.value,
                      },
                    }))
                  }
                  readOnly={!canUpdate}
                />
              </div>
              <div className="space-y-4 rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-4">
                <Input
                  label="Secondary Button Label"
                  value={homeContent.hero.secondaryButtonLabel}
                  onChange={(event) =>
                    setHomeContent((current) => ({
                      ...current,
                      hero: {
                        ...current.hero,
                        secondaryButtonLabel: event.target.value,
                      },
                    }))
                  }
                  readOnly={!canUpdate}
                />
                <Input
                  label="Secondary Button Link"
                  value={homeContent.hero.secondaryButtonHref}
                  onChange={(event) =>
                    setHomeContent((current) => ({
                      ...current,
                      hero: {
                        ...current.hero,
                        secondaryButtonHref: event.target.value,
                      },
                    }))
                  }
                  readOnly={!canUpdate}
                />
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Stats"
            description="Add, remove, and reorder the stats shown below the hero."
          >
            {canUpdate && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setHomeContent((current) => ({
                      ...current,
                      stats: [...current.stats, { ...EMPTY_HOME_STAT }],
                    }))
                  }
                >
                  <HiPlus />
                  Add Stat
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {homeContent.stats.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--color-dark-border)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No stats added yet.
                </p>
              ) : (
                homeContent.stats.map((stat, index) => (
                  <ArrayItemCard
                    key={`home-stat-${index}`}
                    title="Stat"
                    index={index}
                    count={homeContent.stats.length}
                    onMoveUp={() =>
                      setHomeContent((current) => ({
                        ...current,
                        stats: moveItem(current.stats, index, -1),
                      }))
                    }
                    onMoveDown={() =>
                      setHomeContent((current) => ({
                        ...current,
                        stats: moveItem(current.stats, index, 1),
                      }))
                    }
                    onRemove={() =>
                      setHomeContent((current) => ({
                        ...current,
                        stats: current.stats.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                    readOnly={!canUpdate}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Value"
                        value={stat.value}
                        onChange={(event) =>
                          updateHomeStat(index, "value", event.target.value)
                        }
                        readOnly={!canUpdate}
                      />
                      <Input
                        label="Label"
                        value={stat.label}
                        onChange={(event) =>
                          updateHomeStat(index, "label", event.target.value)
                        }
                        readOnly={!canUpdate}
                      />
                    </div>
                  </ArrayItemCard>
                ))
              )}
            </div>
          </SectionBlock>

          <SectionBlock
            title="Services Preview Section"
            description="Controls the copy above the services cards and the button under them."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow"
                value={homeContent.services.eyebrow}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    services: {
                      ...current.services,
                      eyebrow: event.target.value,
                    },
                  }))
                }
                readOnly={!canUpdate}
              />
              <Input
                label="Button Label"
                value={homeContent.services.buttonLabel}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    services: {
                      ...current.services,
                      buttonLabel: event.target.value,
                    },
                  }))
                }
                readOnly={!canUpdate}
              />
            </div>
            <Input
              label="Section Title"
              value={homeContent.services.title}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  services: { ...current.services, title: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <Textarea
              label="Section Description"
              value={homeContent.services.description}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  services: {
                    ...current.services,
                    description: event.target.value,
                  },
                }))
              }
              readOnly={!canUpdate}
            />
            <Input
              label="Button Link"
              value={homeContent.services.buttonHref}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  services: {
                    ...current.services,
                    buttonHref: event.target.value,
                  },
                }))
              }
            />
          </SectionBlock>

          <SectionBlock
            title="Featured Projects Section"
            description="Controls the intro copy and button shown above the featured projects."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Eyebrow"
                value={homeContent.projects.eyebrow}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    projects: {
                      ...current.projects,
                      eyebrow: event.target.value,
                    },
                  }))
                }
                readOnly={!canUpdate}
              />
              <Input
                label="Button Label"
                value={homeContent.projects.buttonLabel}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    projects: {
                      ...current.projects,
                      buttonLabel: event.target.value,
                    },
                  }))
                }
                readOnly={!canUpdate}
              />
            </div>
            <Input
              label="Section Title"
              value={homeContent.projects.title}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  projects: { ...current.projects, title: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <Textarea
              label="Section Description"
              value={homeContent.projects.description}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  projects: {
                    ...current.projects,
                    description: event.target.value,
                  },
                }))
              }
              readOnly={!canUpdate}
            />
            <Input
              label="Button Link"
              value={homeContent.projects.buttonHref}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  projects: {
                    ...current.projects,
                    buttonHref: event.target.value,
                  },
                }))
              }
              readOnly={!canUpdate}
            />
          </SectionBlock>

          <SectionBlock
            title="Closing CTA"
            description="The final call-to-action block at the bottom of the homepage."
          >
            <Input
              label="CTA Title"
              value={homeContent.cta.title}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  cta: { ...current.cta, title: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <Textarea
              label="CTA Description"
              value={homeContent.cta.description}
              onChange={(event) =>
                setHomeContent((current) => ({
                  ...current,
                  cta: { ...current.cta, description: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="CTA Button Label"
                value={homeContent.cta.buttonLabel}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    cta: { ...current.cta, buttonLabel: event.target.value },
                  }))
                }
                readOnly={!canUpdate}
              />
              <Input
                label="CTA Button Link"
                value={homeContent.cta.buttonHref}
                onChange={(event) =>
                  setHomeContent((current) => ({
                    ...current,
                    cta: { ...current.cta, buttonHref: event.target.value },
                  }))
                }
                readOnly={!canUpdate}
              />
            </div>
          </SectionBlock>
        </Card>
      </form>

      <form onSubmit={handleAboutSubmit}>
        <Card hover={false} className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-[var(--color-dark-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
                About
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                About Page Content
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Page header, story, company values, and team members.
              </p>
            </div>
            <Button type="submit" disabled={savingAbout || !canUpdate}>
              {savingAbout ? "Saving..." : "Save About Page"}
            </Button>
          </div>

          <SectionBlock
            title="Page Header"
            description="Top title and description shown on the About page."
          >
            <Input
              label="Title"
              value={aboutContent.header.title}
              onChange={(event) =>
                setAboutContent((current) => ({
                  ...current,
                  header: { ...current.header, title: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <Textarea
              label="Description"
              value={aboutContent.header.description}
              onChange={(event) =>
                setAboutContent((current) => ({
                  ...current,
                  header: {
                    ...current.header,
                    description: event.target.value,
                  },
                }))
              }
              readOnly={!canUpdate}
            />
          </SectionBlock>

          <SectionBlock
            title="Story Section"
            description="Use blank lines to separate story paragraphs."
          >
            <Input
              label="Story Title"
              value={aboutContent.story.title}
              onChange={(event) =>
                setAboutContent((current) => ({
                  ...current,
                  story: { ...current.story, title: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <Textarea
              label="Story Body"
              value={aboutContent.story.body}
              onChange={(event) =>
                setAboutContent((current) => ({
                  ...current,
                  story: { ...current.story, body: event.target.value },
                }))
              }
              className="min-h-[180px]"
              readOnly={!canUpdate}
            />
          </SectionBlock>

          <SectionBlock
            title="Values Section"
            description="Edit the section title and the cards that appear underneath."
          >
            <div className="flex flex-col gap-4">
              <Input
                label="Values Section Title"
                value={aboutContent.valuesTitle}
                onChange={(event) =>
                  setAboutContent((current) => ({
                    ...current,
                    valuesTitle: event.target.value,
                  }))
                }
                readOnly={!canUpdate}
              />
              {canUpdate && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setAboutContent((current) => ({
                        ...current,
                        values: [...current.values, { ...EMPTY_ABOUT_VALUE }],
                      }))
                    }
                  >
                    <HiPlus />
                    Add Value
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {aboutContent.values.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--color-dark-border)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No values added yet.
                </p>
              ) : (
                aboutContent.values.map((valueItem, index) => (
                  <ArrayItemCard
                    key={`about-value-${index}`}
                    title="Value Card"
                    index={index}
                    count={aboutContent.values.length}
                    onMoveUp={() =>
                      setAboutContent((current) => ({
                        ...current,
                        values: moveItem(current.values, index, -1),
                      }))
                    }
                    onMoveDown={() =>
                      setAboutContent((current) => ({
                        ...current,
                        values: moveItem(current.values, index, 1),
                      }))
                    }
                    onRemove={() =>
                      setAboutContent((current) => ({
                        ...current,
                        values: current.values.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                    readOnly={!canUpdate}
                  >
                    <SelectField
                      label="Icon"
                      value={valueItem.icon}
                      onChange={(value) => updateAboutValue(index, "icon", value)}
                      options={ABOUT_VALUE_ICON_OPTIONS}
                      disabled={!canUpdate}
                    />
                    <Input
                      label="Title"
                      value={valueItem.title}
                      onChange={(event) =>
                        updateAboutValue(index, "title", event.target.value)
                      }
                      readOnly={!canUpdate}
                    />
                    <Textarea
                      label="Description"
                      value={valueItem.description}
                      onChange={(event) =>
                        updateAboutValue(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                      readOnly={!canUpdate}
                    />
                  </ArrayItemCard>
                ))
              )}
            </div>
          </SectionBlock>

          <SectionBlock
            title="Team Section"
            description="Team cards can be reordered, renamed, or given uploaded profile images."
          >
            <div className="flex flex-col gap-4">
              <Input
                label="Team Section Title"
                value={aboutContent.teamTitle}
                onChange={(event) =>
                  setAboutContent((current) => ({
                    ...current,
                    teamTitle: event.target.value,
                  }))
                }
                readOnly={!canUpdate}
              />
              {canUpdate && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setAboutContent((current) => ({
                        ...current,
                        teamMembers: [
                          ...current.teamMembers,
                          { ...EMPTY_TEAM_MEMBER },
                        ],
                      }))
                    }
                  >
                    <HiPlus />
                    Add Team Member
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {aboutContent.teamMembers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--color-dark-border)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No team members added yet.
                </p>
              ) : (
                aboutContent.teamMembers.map((member, index) => (
                  <ArrayItemCard
                    key={`team-member-${index}`}
                    title="Team Member"
                    index={index}
                    count={aboutContent.teamMembers.length}
                    onMoveUp={() =>
                      setAboutContent((current) => ({
                        ...current,
                        teamMembers: moveItem(current.teamMembers, index, -1),
                      }))
                    }
                    onMoveDown={() =>
                      setAboutContent((current) => ({
                        ...current,
                        teamMembers: moveItem(current.teamMembers, index, 1),
                      }))
                    }
                    onRemove={() =>
                      setAboutContent((current) => ({
                        ...current,
                        teamMembers: current.teamMembers.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                    readOnly={!canUpdate}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Name"
                        value={member.name}
                        onChange={(event) =>
                          updateTeamMember(index, "name", event.target.value)
                        }
                        readOnly={!canUpdate}
                      />
                      <Input
                        label="Role"
                        value={member.role}
                        onChange={(event) =>
                          updateTeamMember(index, "role", event.target.value)
                        }
                        readOnly={!canUpdate}
                      />
                    </div>
                    <ImageUpload
                      label="Profile Image"
                      value={member.image}
                      onChange={(url) =>
                        updateTeamMember(index, "image", String(url))
                      }
                      folder="team"
                      disabled={!canUpdate}
                    />
                  </ArrayItemCard>
                ))
              )}
            </div>
          </SectionBlock>
        </Card>
      </form>

      <form onSubmit={handleContactSubmit}>
        <Card hover={false} className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-[var(--color-dark-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
                Contact
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Contact + Footer Content
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Shared contact details used in the Contact page cards and footer.
              </p>
            </div>
            <Button type="submit" disabled={savingContact || !canUpdate}>
              {savingContact ? "Saving..." : "Save Contact Content"}
            </Button>
          </div>

          <SectionBlock
            title="Contact Page Header"
            description="Controls the title and intro text shown at the top of the Contact page."
          >
            <Input
              label="Title"
              value={contactContent.header.title}
              onChange={(event) =>
                setContactContent((current) => ({
                  ...current,
                  header: { ...current.header, title: event.target.value },
                }))
              }
              readOnly={!canUpdate}
            />
            <Textarea
              label="Description"
              value={contactContent.header.description}
              onChange={(event) =>
                setContactContent((current) => ({
                  ...current,
                  header: {
                    ...current.header,
                    description: event.target.value,
                  },
                }))
              }
              readOnly={!canUpdate}
            />
          </SectionBlock>

          <SectionBlock
            title="Shared Contact Details"
            description="Update once here and the same details will appear in both the footer and the Contact page."
          >
            <Input
              label="Footer Section Title"
              value={contactContent.footerTitle}
              onChange={(event) =>
                setContactContent((current) => ({
                  ...current,
                  footerTitle: event.target.value,
                }))
              }
              readOnly={!canUpdate}
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-4 rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-4">
                <Input
                  label="Email Label"
                  value={contactContent.email.label}
                  onChange={(event) =>
                    updateContactField("email", "label", event.target.value)
                  }
                  readOnly={!canUpdate}
                />
                <Input
                  label="Email Value"
                  value={contactContent.email.value}
                  onChange={(event) =>
                    updateContactField("email", "value", event.target.value)
                  }
                  readOnly={!canUpdate}
                />
              </div>

              <div className="space-y-4 rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-4">
                <Input
                  label="Phone Label"
                  value={contactContent.phone.label}
                  onChange={(event) =>
                    updateContactField("phone", "label", event.target.value)
                  }
                  readOnly={!canUpdate}
                />
                <Input
                  label="Phone Value"
                  value={contactContent.phone.value}
                  onChange={(event) =>
                    updateContactField("phone", "value", event.target.value)
                  }
                  readOnly={!canUpdate}
                />
              </div>

              <div className="space-y-4 rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-4">
                <Input
                  label="Location Label"
                  value={contactContent.location.label}
                  onChange={(event) =>
                    updateContactField("location", "label", event.target.value)
                  }
                  readOnly={!canUpdate}
                />
                <Input
                  label="Location Value"
                  value={contactContent.location.value}
                  onChange={(event) =>
                    updateContactField("location", "value", event.target.value)
                  }
                  readOnly={!canUpdate}
                />
              </div>
            </div>
          </SectionBlock>
        </Card>
      </form>
    </div>
  );
}
