from fastapi import APIRouter, HTTPException, Response
from psycopg2.extras import RealDictCursor
from database import get_db_connection, release_db_connection
from fpdf import FPDF
import pandas as pd
import io
import json

router = APIRouter(prefix="/api/reports", tags=["Reports"])

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'GenAI-Audit Report', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

@router.get("/export/pdf/{audit_id}")
def export_audit_pdf(audit_id: int):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT a.*, ag.name as agent_name 
            FROM audits a 
            JOIN agents ag ON a.agent_id = ag.id 
            WHERE a.id = %s
        """, (audit_id,))
        audit = cur.fetchone()
        cur.close()
        
        if not audit:
            raise HTTPException(status_code=404, detail="Audit not found")
        
        pdf = PDF()
        pdf.add_page()
        pdf.set_font('Helvetica', 'B', 12)
        
        # Audit Info
        pdf.cell(0, 10, f"Audit ID: {audit['id']}", 0, 1)
        pdf.cell(0, 10, f"Agent: {audit['agent_name']}", 0, 1)
        pdf.cell(0, 10, f"Date: {audit['created_at'].strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
        pdf.cell(0, 10, f"Type: {audit['type'].capitalize()}", 0, 1)
        pdf.ln(5)
        
        # Scores
        pdf.set_font('Helvetica', 'B', 14)
        pdf.cell(0, 10, "Intelligence Scores", 0, 1)
        pdf.set_font('Helvetica', '', 12)
        pdf.cell(0, 10, f"Overall Score: {audit['overall_score']}%", 0, 1)
        pdf.cell(0, 10, f"Compliance Score: {audit['compliance_score']}%", 0, 1)
        pdf.cell(0, 10, f"Empathy Score: {audit['empathy_score']}%", 0, 1)
        pdf.cell(0, 10, f"Resolution Score: {audit['resolution_score']}%", 0, 1)
        pdf.ln(5)
        
        # Violations
        pdf.set_font('Helvetica', 'B', 14)
        pdf.cell(0, 10, "Compliance Violations", 0, 1)
        pdf.set_font('Helvetica', '', 12)
        violations = audit['violations']
        if isinstance(violations, str):
            violations = json.loads(violations)
        
        if not violations:
            pdf.cell(0, 10, "No violations detected.", 0, 1)
        else:
            for v in violations:
                pdf.set_font('Helvetica', 'B', 10)
                pdf.cell(0, 8, f"{v.get('type')} - {v.get('severity')}", 0, 1)
                pdf.set_font('Helvetica', '', 10)
                pdf.multi_cell(0, 8, v.get('description'))
                pdf.ln(2)
        
        pdf.ln(5)
        pdf.set_font('Helvetica', 'B', 14)
        pdf.cell(0, 10, "Suggestions", 0, 1)
        pdf.set_font('Helvetica', '', 12)
        pdf.multi_cell(0, 10, audit['suggestions'])
        
        pdf_output = bytes(pdf.output())
        return Response(content=pdf_output, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename=audit_{audit_id}.pdf"
        })
    finally:
        release_db_connection(conn)

@router.get("/export/excel")
def export_audits_excel():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT a.id, ag.name as agent_name, a.type, a.overall_score, a.compliance_score, 
                   a.empathy_score, a.resolution_score, a.created_at
            FROM audits a 
            JOIN agents ag ON a.agent_id = ag.id 
            ORDER BY a.created_at DESC
        """)
        audits = cur.fetchall()
        cur.close()
        
        df = pd.DataFrame(audits)
        # Convert timezone-aware datetime to timezone-naive for Excel
        if not df.empty:
            df['created_at'] = df['created_at'].dt.tz_localize(None)
            
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Audits Summary')
        
        output.seek(0)
        return Response(content=output.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=audits_summary.xlsx"
        })
    finally:
        release_db_connection(conn)
