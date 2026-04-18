"use client"
import { useState } from "react"
import { ServiceLeadModal } from "@/components/ui/ServiceLeadModal"
import { GraduationCap, ClipboardList } from "lucide-react"

export function ServicesSidebar() {
  const [modalService, setModalService] = useState<"interview_prep" | "csca" | null>(null)

  return (
    <>
      {/* Fixed right-side banner — desktop only */}
      <div className="hidden xl:flex flex-col gap-3" style={{
        position: 'fixed',
        right: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        width: 180,
      }}>
        {/* Card 1: Interview Prep */}
        <div
          className="liquid-card cursor-pointer"
          style={{ padding: '16px 14px' }}
          onClick={() => setModalService("interview_prep")}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-accent)', color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: '0 1.25rem 0 8px', fontFamily: 'Montserrat, sans-serif' }}>
            FREE
          </div>
          <GraduationCap size={22} style={{ color: 'var(--color-accent)', marginBottom: 8 }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'Montserrat, sans-serif', lineHeight: 1.3, marginBottom: 6 }}>
            University Interview Preparation
          </p>
          <button className="btn-accent btn-liquid" style={{ fontSize: 11, padding: '6px 10px', width: '100%', justifyContent: 'center' }}>
            Get Free Prep →
          </button>
        </div>

        {/* Card 2: CSCA */}
        <div
          className="liquid-card cursor-pointer"
          style={{ padding: '16px 14px' }}
          onClick={() => setModalService("csca")}
        >
          <ClipboardList size={22} style={{ color: 'var(--color-accent)', marginBottom: 8 }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'Montserrat, sans-serif', lineHeight: 1.3, marginBottom: 6 }}>
            CSCA Assessment Preparation
          </p>
          <button className="btn-ghost btn-liquid" style={{ fontSize: 11, padding: '6px 10px', width: '100%', justifyContent: 'center' }}>
            Register Now →
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalService && (
        <ServiceLeadModal
          serviceType={modalService}
          isOpen={true}
          onClose={() => setModalService(null)}
        />
      )}
    </>
  )
}
