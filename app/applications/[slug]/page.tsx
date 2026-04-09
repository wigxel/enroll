import React from "react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplicationForm from "@/components/forms/ApplicationForm";

import { api } from "@/convex/_generated/api";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  GraduationCap,
  Quote,
  Star,
  User,
} from "lucide-react";

interface CourseApplicationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CourseApplicationPageProps): Promise<Metadata> {
  const result = await fetchQuery(api.courses.getBySlug, {
    slug: (await params).slug,
  });
  const course = result?.success ? result.data : null;
  if (!course) return { title: "Course Not Found" };
  return {
    title: `Apply — ${course.name}`,
    description: course.description,
  };
}

// ---------------------------------------------------------------------------
// Static content — swap for DB-driven data when available
// ---------------------------------------------------------------------------

const PREREQUISITES = [
  "No prior experience required — this program is designed for beginners.",
  "Basic computer literacy (browsing the web, typing, managing files).",
  "A personal laptop or desktop with a stable internet connection.",
  "Willingness to commit 10–15 hours per week to coursework.",
  "Passion for the subject matter and a desire to grow professionally.",
];

const INSTRUCTORS = [
  {
    name: "Dr. Amina Okafor",
    title: "Lead Instructor & Curriculum Designer",
    bio: "Former Head of Training at Zenith Bank with 15+ years of industry experience. Ph.D in Educational Technology from University of Lagos.",
    expertise: ["Curriculum Design", "Industry Training", "Mentorship"],
    initials: "AO",
    color: "from-indigo-500 to-purple-600",
  },
  {
    name: "Emeka Chukwu",
    title: "Senior Practitioner & Guest Lecturer",
    bio: "Seasoned professional with 12 years in the field. Founder of two successful ventures and a sought-after keynote speaker across West Africa.",
    expertise: ["Practical Application", "Entrepreneurship", "Strategy"],
    initials: "EC",
    color: "from-emerald-500 to-teal-600",
  },
];

const REVIEWS = [
  {
    name: "Fatima Bello",
    role: "Data Analyst, Access Bank",
    rating: 5,
    text: "This program completely transformed my career trajectory. The instructors are world-class, the curriculum is practical, and the alumni network is invaluable. I landed a role at Access Bank within two months of graduating.",
    year: "2024",
    initials: "FB",
    color: "from-rose-500 to-pink-600",
  },
  {
    name: "Chidi Nwosu",
    role: "Product Manager, Flutterwave",
    rating: 5,
    text: "I was skeptical at first, but the quality of teaching and the hands-on projects blew me away. The mentorship from Dr. Okafor alone was worth the entire tuition.",
    year: "2023",
    initials: "CN",
    color: "from-sky-500 to-cyan-600",
  },
  {
    name: "Adaeze Okonkwo",
    role: "Founder, TechAda Solutions",
    rating: 5,
    text: "Best investment I have ever made in myself. The skills I gained here directly enabled me to start my own company and secure my first three clients within 90 days.",
    year: "2024",
    initials: "AO",
    color: "from-amber-500 to-orange-600",
  },
];

const FAQS = [
  {
    q: "Who is this program designed for?",
    a: "This program welcomes complete beginners as well as professionals looking to upskill. Our curriculum is structured to meet you at your current level and progressively build your competence.",
  },
  {
    q: "Is the program fully online or in-person?",
    a: "The program is delivered in a hybrid format — live virtual sessions twice a week supplemented by in-person workshops once a month. All sessions are recorded for flexibility.",
  },
  {
    q: "How long does the program take to complete?",
    a: "The program runs for the duration stated on this page. You will graduate at the end of the structured cohort alongside your peers, with a certification ceremony.",
  },
  {
    q: "What happens after I pay the application fee?",
    a: "Your application is reviewed by our admissions team within 3–5 business days. Once approved, you will receive an offer letter and payment instructions for the tuition fee.",
  },
  {
    q: "Is there a payment plan for tuition?",
    a: "Yes. We offer a flexible installment plan that lets you pay tuition in up to three tranches. Reach out to admissions after you receive your offer letter for details.",
  },
  {
    q: "What certification will I receive?",
    a: "Graduates receive an industry-recognised certificate issued by our institution, verifiable online. The certificate details the competencies you have demonstrated throughout the program.",
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function CourseApplicationPage({
  params,
}: CourseApplicationPageProps) {
  const [courseResult, appStatusResult] = await Promise.all([
    fetchQuery(api.courses.getBySlug, { slug: (await params).slug }),
    fetchQuery(api.settings.getAppStatus),
  ]);

  const course = courseResult?.success ? courseResult.data : null;
  const appStatus = appStatusResult?.success ? appStatusResult.data : null;

  if (!course) notFound();

  return (
    <div className="min-h-screen">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50">
        <div className="h-16 flex items-center justify-between mx-auto container bg-background/90 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
          <nav className="flex-1 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/applications"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Applications
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  /
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {course.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex-1 text-center font-semibold text-gray-900 dark:text-white line-clamp-1">
            {course.name}
          </div>

          <div className="flex-1 flex justify-end">
            <a
              href="/brochure.pdf"
              download
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Brochure
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero testimonial banner ── */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 mb-3">
                Student Story
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Hear from our graduates
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our students have gone on to land jobs at top companies, build
                their own startups, and transform their careers. Watch this
                short testimonial to see how this program can change your life
                too.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { stat: "95%", label: "Completion Rate" },
                  { stat: "2x", label: "Avg. Salary Jump" },
                  { stat: "500+", label: "Alumni Network" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {item.stat}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/qhbuKbxJsk8?rel=0"
                title="Student Testimonial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Left Column: Course summary card ── */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 rounded-2xl bg-background overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="relative h-48 bg-gray-100 dark:bg-zinc-800">
                {course.coverPhoto ? (
                  <Image
                    src={course.coverPhoto}
                    alt={course.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 image-gradient flex items-center justify-center">
                    <span className="text-3xl font-bold text-white/50">
                      {course.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  {course.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                      <Clock className="h-4 w-4" /> Duration
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                      <Award className="h-4 w-4" /> Certification
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {course.certification}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                      <GraduationCap className="h-4 w-4" /> Tuition
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {course.tuitionFee
                        ? `₦${course.tuitionFee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>

                  {appStatus?.applicationFeeAmount ? (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Application Fee
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        ₦{appStatus.applicationFeeAmount.toLocaleString()}
                        <span className="text-xs font-normal text-gray-400">
                          (one-time)
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Download Brochure CTA */}
                <a
                  href="/brochure.pdf"
                  download
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group"
                >
                  <Download className="h-4 w-4 group-hover:animate-bounce" />
                  Download Programme Brochure
                </a>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-8 space-y-16">

            {/* Prerequisites */}
            <section>
              <SectionHeading
                icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
                title="Prerequisites"
                subtitle="What you need before you start"
              />
              <ul className="mt-6 space-y-3">
                {PREREQUISITES.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-background p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructors */}
            <section>
              <SectionHeading
                icon={<User className="h-5 w-5 text-indigo-500" />}
                title="Meet Your Instructors"
                subtitle="Learn from seasoned practitioners"
              />
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {INSTRUCTORS.map((ins) => (
                  <div
                    key={ins.name}
                    className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background overflow-hidden"
                  >
                    {/* Colour banner */}
                    <div
                      className={`h-20 bg-gradient-to-br ${ins.color} relative`}
                    >
                      <div className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-md ring-2 ring-white dark:ring-zinc-900">
                        <span
                          className={`bg-gradient-to-br ${ins.color} bg-clip-text text-transparent font-bold text-sm`}
                        >
                          {ins.initials}
                        </span>
                      </div>
                    </div>
                    <div className="pt-9 px-5 pb-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {ins.name}
                      </h3>
                      <p className="text-xs text-indigo-500 font-medium mt-0.5">
                        {ins.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                        {ins.bio}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {ins.expertise.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Alumni Reviews */}
            <section>
              <SectionHeading
                icon={<Star className="h-5 w-5 text-amber-400" />}
                title="Alumni Reviews"
                subtitle="What our graduates say about the program"
              />
              {/* Average rating bar */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  5.0
                </span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Based on {REVIEWS.length} verified alumni reviews
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                {REVIEWS.map((review) => (
                  <div
                    key={review.name}
                    className="relative rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background p-6"
                  >
                    <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-100 dark:text-zinc-800" />
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      "{review.text}"
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${review.color} text-white text-xs font-bold`}
                      >
                        {review.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {review.name}
                        </p>
                        <p className="text-xs text-gray-400">{review.role} · {review.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section>
              <SectionHeading
                icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
                title="Frequently Asked Questions"
                subtitle="Everything you need to know before applying"
              />
              <div className="mt-6 divide-y divide-gray-100 dark:divide-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background overflow-hidden">
                {FAQS.map((faq, i) => (
                  <FaqItem key={i} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </section>

            {/* Application Form */}
            <section>
              <SectionHeading
                icon={<GraduationCap className="h-5 w-5 text-indigo-500" />}
                title="Application Form"
                subtitle={`Apply now and secure your spot in the next ${course.name} cohort`}
              />
              <div className="mt-6 bg-background rounded-2xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800">
                <ApplicationForm defaultCourseId={course._id} />
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
        {question}
        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 shrink-0 ml-4" />
      </summary>
      <div className="px-6 pb-4 pt-0 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
