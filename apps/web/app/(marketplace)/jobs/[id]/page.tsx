import type { Metadata } from "next";
import { JobPostingDto } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { JobDetailClient } from "./job-detail-client";
import { safeJsonLd } from "@/lib/safe-json-ld";

async function getJob(id: string): Promise<JobPostingDto | null> {
  try {
    return await apiFetch<JobPostingDto>(`/jobs/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJob(params.id);
  if (!job) return { title: "İlan Bulunamadı — İmece Pazaryeri" };

  const title = `${job.title} — ${job.companyName} | İmece Pazaryeri`;
  const description = job.description
    ? job.description.slice(0, 160)
    : `${job.title} iş ilanı — ${job.city}. İmece Pazaryeri'nde incele.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);

  return (
    <>
      {job && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              title: job.title,
              description: job.description,
              datePosted: job.createdAt,
              employmentType: job.employmentType,
              hiringOrganization: {
                "@type": "Organization",
                name: job.companyName,
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.district ?? job.city,
                  addressRegion: job.city,
                  addressCountry: "TR",
                },
              },
              ...(job.salaryMin || job.salaryMax
                ? {
                    baseSalary: {
                      "@type": "MonetaryAmount",
                      currency: "TRY",
                      value: {
                        "@type": "QuantitativeValue",
                        minValue: job.salaryMin ?? job.salaryMax,
                        maxValue: job.salaryMax ?? job.salaryMin,
                        unitText: "MONTH",
                      },
                    },
                  }
                : {}),
            }),
          }}
        />
      )}
      <JobDetailClient />
    </>
  );
}
