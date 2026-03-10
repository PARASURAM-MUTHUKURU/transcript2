from fastapi import APIRouter, HTTPException, Response, Query
from typing import Optional
from psycopg2.extras import RealDictCursor
from database import get_db_connection, release_db_connection
from fpdf import FPDF
import pandas as pd
import io
import json

router = APIRouter(prefix="/api/reports", tags=["Reports"])

class PDF(FPDF):
    def header(self):
        # Logo
        try:
            logo_path = r"C:\Users\ASUS\.gemini\antigravity\brain\8e9ec424-ddef-4b0b-a9e0-25b99af744f8\genai_audit_logo_1773148944090.png"
            self.image(logo_path, 10, 8, 33)
        except:
            pass
            
        # Title
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(242, 125, 38) # Brand Orange
        self.cell(80)
        self.cell(110, 10, 'COMPLIANCE AUDIT REPORT', 0, 0, 'R')
        
        # Subtitle
        self.ln(8)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(100, 100, 100)
        self.cell(80)
        self.cell(110, 10, 'GENAI-AUDIT INTELLIGENCE PLATFORM', 0, 0, 'R')
        
        # Header Line
        self.ln(12)
        self.set_draw_color(242, 125, 38)
        self.set_line_width(0.5)
        self.line(10, 32, 200, 32)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Confidential - AI Generated Quality Report - Page {self.page_no()}', 0, 0, 'C')

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
        
        try:
            pdf = PDF()
            pdf.add_page()
            
            # 1. Overview Section
            pdf.set_fill_color(250, 250, 250)
            pdf.set_font('Helvetica', 'B', 14)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 10, "AUDIT OVERVIEW", 0, 1, 'L')
            pdf.ln(2)
            
            # Meta info grid
            pdf.set_font('Helvetica', '', 10)
            col_width = 95
            
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(30, 8, "Audit ID:", 0)
            pdf.set_font('Helvetica', '', 10)
            pdf.cell(col_width-30, 8, f"#{audit['id']}", 0)
            
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(30, 8, "Agent:", 0)
            pdf.set_font('Helvetica', '', 10)
            pdf.cell(col_width-30, 8, audit['agent_name'], 0, 1)
            
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(30, 8, "Date:", 0)
            pdf.set_font('Helvetica', '', 10)
            pdf.cell(col_width-30, 8, audit['created_at'].strftime('%Y-%m-%d %H:%M:%S'), 0)
            
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(30, 8, "Call Type:", 0)
            pdf.set_font('Helvetica', '', 10)
            pdf.cell(col_width-30, 8, audit['type'].upper(), 0, 1)
            
            pdf.ln(8)
            
            # 2. Key Intelligence Scores
            pdf.set_draw_color(230, 230, 230)
            pdf.set_fill_color(242, 125, 38) # Brand color for the box
            pdf.set_text_color(255, 255, 255)
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(190, 10, "  INTELLIGENCE SCORECARD", 1, 1, 'L', True)
            
            pdf.ln(2)
            pdf.set_text_color(50, 50, 50)
            
            def draw_score(label, score, x, y):
                pdf.set_xy(x, y)
                pdf.set_font('Helvetica', 'B', 9)
                pdf.set_text_color(100, 100, 100)
                pdf.cell(45, 5, label.upper(), 0, 1, 'C')
                
                pdf.set_x(x)
                pdf.set_font('Helvetica', 'B', 24)
                # Color based on score
                if score >= 80: pdf.set_text_color(40, 167, 69) # Green
                elif score >= 60: pdf.set_text_color(242, 125, 38) # Orange
                else: pdf.set_text_color(220, 53, 69) # Red
                
                pdf.cell(45, 12, f"{score}%", 0, 1, 'C')
                
            curr_y = pdf.get_y()
            draw_score("Overall Performance", audit['overall_score'], 10, curr_y)
            draw_score("Compliance", audit['compliance_score'], 55, curr_y)
            draw_score("Empathy", audit['empathy_score'], 100, curr_y)
            draw_score("Resolution", audit['resolution_score'], 145, curr_y)
            
            pdf.set_xy(10, curr_y + 20)
            pdf.ln(10)
            
            # 3. Compliance Violations
            pdf.set_font('Helvetica', 'B', 14)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 10, "COMPLIANCE VIOLATIONS", 0, 1, 'L')
            pdf.ln(2)
            
            violations = audit['violations']
            if isinstance(violations, str):
                violations = json.loads(violations)
                
            if not violations:
                pdf.set_font('Helvetica', 'I', 10)
                pdf.set_text_color(100, 100, 100)
                pdf.cell(0, 10, "No compliance violations were detected during this audit.", 0, 1)
            else:
                for v in violations:
                    severity = v.get('severity', 'Low')
                    # Color code for severity indicator
                    if severity == 'Critical': pdf.set_fill_color(220, 53, 69)
                    elif severity == 'High': pdf.set_fill_color(242, 125, 38)
                    else: pdf.set_fill_color(108, 117, 125)
                    
                    # Draw small indicator box
                    indicator_y = pdf.get_y()
                    pdf.rect(10, indicator_y+1, 2, 12, 'F')
                    
                    pdf.set_x(15)
                    pdf.set_font('Helvetica', 'B', 11)
                    pdf.set_text_color(50, 50, 50)
                    pdf.cell(100, 7, v.get('type'), 0, 0)
                    
                    pdf.set_font('Helvetica', 'B', 8)
                    pdf.set_text_color(255, 255, 255)
                    pdf.cell(25, 5, severity.upper(), 0, 1, 'C', True)
                    
                    pdf.set_x(15)
                    pdf.set_font('Helvetica', '', 10)
                    pdf.set_text_color(100, 100, 100)
                    pdf.multi_cell(0, 6, v.get('description'))
                    pdf.ln(4)
            
            pdf.ln(6)
            
            # 4. Critical Suggestions & Feedback
            pdf.set_font('Helvetica', 'B', 14)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 10, "STRATEGIC RECOMMENDATIONS", 0, 1, 'L')
            pdf.ln(2)
            
            pdf.set_fill_color(255, 245, 235) # Faint orange background for suggestion box
            pdf.set_font('Helvetica', '', 11)
            pdf.set_text_color(60, 60, 60)
            pdf.multi_cell(0, 8, audit['suggestions'], border=0, fill=True)
            
            pdf_output = bytes(pdf.output())
            return Response(content=pdf_output, media_type="application/pdf", headers={
                "Content-Disposition": f"attachment; filename=audit_{audit_id}.pdf"
            })
        except Exception as e:
            print(f"PDF EXPORT ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
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

@router.get("/export/summary")
def export_summary_pdf(metrics: Optional[str] = Query(None)):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        selected = metrics.split(',') if metrics else []
        
        # 1. Fetch Stats
        cur.execute("""
            SELECT 
                ag.name as agent_name,
                AVG(a.overall_score) as avg_score,
                AVG(a.compliance_score) as avg_compliance,
                COUNT(a.id) as total_audits
            FROM agents ag
            LEFT JOIN audits a ON ag.id = a.agent_id
            GROUP BY ag.id, ag.name
            HAVING COUNT(a.id) > 0
            ORDER BY avg_score DESC
        """)
        stats = cur.fetchall()
        
        # 2. Fetch Recent Audits (for violations and suggestions if needed)
        cur.execute("""
            SELECT a.id, ag.name as agent_name, a.overall_score, a.compliance_score, 
                   a.created_at, a.violations, a.suggestions
            FROM audits a 
            JOIN agents ag ON a.agent_id = ag.id 
            ORDER BY a.created_at DESC LIMIT 10
        """)
        recent_audits = cur.fetchall()
        
        # 3. Fetch Trend Data if selected
        trend_data = []
        if 'Trend Analysis' in selected:
            cur.execute("""
                SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, AVG(overall_score) as avg_score
                FROM audits GROUP BY date ORDER BY date DESC LIMIT 7
            """)
            trend_data = cur.fetchall()
            
        cur.close()

        pdf = PDF()
        pdf.add_page()
        
        # --- EXECUTIVE SUMMARY (Quality Scores & Compliance Rate) ---
        show_perf = 'Quality Scores' in selected or not selected
        show_comp = 'Compliance Rate' in selected or not selected
        
        if show_perf or show_comp:
            pdf.set_fill_color(250, 250, 250)
            pdf.set_font('Helvetica', 'B', 16)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 12, "EXECUTIVE SUMMARY", 0, 1, 'L')
            pdf.set_draw_color(242, 125, 38)
            pdf.line(10, pdf.get_y(), 60, pdf.get_y())
            pdf.ln(8)
            
            if stats:
                avg_perf = sum(s['avg_score'] for s in stats) / len(stats)
                avg_comp = sum(s['avg_compliance'] for s in stats) / len(stats)
                total_audits_count = sum(s['total_audits'] for s in stats)
                
                pdf.set_font('Helvetica', 'B', 12)
                pdf.set_text_color(100, 100, 100)
                pdf.cell(0, 10, f"Analysis period includes {total_audits_count} total audits across {len(stats)} active agents.", 0, 1)
                pdf.ln(5)
                
                curr_y = pdf.get_y()
                def draw_big_stat(label, value, x, y):
                    pdf.set_xy(x, y)
                    pdf.set_fill_color(248, 240, 230)
                    pdf.rect(x, y, 60, 25, 'F')
                    pdf.set_xy(x, y + 5)
                    pdf.set_font('Helvetica', 'B', 9)
                    pdf.set_text_color(150, 100, 50)
                    pdf.cell(60, 5, label.upper(), 0, 1, 'C')
                    pdf.set_x(x)
                    pdf.set_font('Helvetica', 'B', 16)
                    pdf.set_text_color(242, 125, 38)
                    pdf.cell(60, 10, f"{round(value, 1)}%", 0, 1, 'C')

                if show_perf: draw_big_stat("Avg Performance", avg_perf, 25, curr_y)
                if show_comp: draw_big_stat("Avg Compliance", avg_comp, 105, curr_y)
                pdf.set_xy(10, curr_y + 35)

        # --- AGENT PERFORMANCE TABLE (Agent Rankings) ---
        if 'Agent Rankings' in selected or not selected:
            pdf.set_font('Helvetica', 'B', 14)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 10, "AGENT PERFORMANCE RANKINGS", 0, 1, 'L')
            pdf.ln(3)
            
            pdf.set_fill_color(242, 125, 38)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(70, 10, " AGENT NAME", 1, 0, 'L', True)
            pdf.cell(40, 10, " AVG SCORE", 1, 0, 'C', True)
            pdf.cell(40, 10, " AVG COMP", 1, 0, 'C', True)
            pdf.cell(40, 10, " AUDITS", 1, 1, 'C', True)
            
            pdf.set_text_color(50, 50, 50)
            pdf.set_font('Helvetica', '', 10)
            for i, s in enumerate(stats):
                fill = (i % 2 == 1)
                pdf.set_fill_color(250, 250, 250) if fill else pdf.set_fill_color(255, 255, 255)
                pdf.cell(70, 10, f" {s['agent_name']}", 1, 0, 'L', fill)
                score = round(s['avg_score'])
                if score >= 80: pdf.set_text_color(40, 167, 69)
                elif score < 60: pdf.set_text_color(220, 53, 69)
                else: pdf.set_text_color(242, 125, 38)
                pdf.cell(40, 10, f"{score}%", 1, 0, 'C', fill)
                pdf.set_text_color(50, 50, 50)
                pdf.cell(40, 10, f"{round(s['avg_compliance'])}%", 1, 0, 'C', fill)
                pdf.cell(40, 10, f"{s['total_audits']}", 1, 1, 'C', fill)
            pdf.ln(10)

        # --- TREND ANALYSIS ---
        if 'Trend Analysis' in selected and trend_data:
            pdf.set_font('Helvetica', 'B', 14)
            pdf.cell(0, 10, "TREND ANALYSIS (LAST 7 DAYS)", 0, 1, 'L')
            pdf.ln(3)
            pdf.set_font('Helvetica', '', 10)
            for t in trend_data:
                pdf.cell(60, 8, f"Date: {t['date']}", 0)
                pdf.cell(60, 8, f"Average Score: {round(t['avg_score'])}%", 0, 1)
            pdf.ln(10)

        # --- VIOLATION DETAILS ---
        if 'Violation Details' in selected:
            pdf.add_page()
            pdf.set_font('Helvetica', 'B', 14)
            pdf.cell(0, 10, "CRITICAL VIOLATION INSIGHTS", 0, 1, 'L')
            pdf.ln(3)
            for a in recent_audits:
                v_list = a['violations']
                if isinstance(v_list, str): v_list = json.loads(v_list)
                if not v_list: continue
                
                for v in v_list:
                    if v.get('severity') in ['Critical', 'High']:
                        pdf.set_font('Helvetica', 'B', 10)
                        pdf.set_text_color(220, 53, 69)
                        pdf.cell(0, 8, f"[{v.get('severity')}] {v.get('type')} - Agent: {a['agent_name']}", 0, 1)
                        pdf.set_font('Helvetica', '', 9)
                        pdf.set_text_color(80, 80, 80)
                        pdf.multi_cell(0, 6, v.get('description'))
                        pdf.ln(2)
            pdf.ln(10)

        # --- SUGGESTIONS ---
        if 'Suggestions' in selected:
            if pdf.get_y() > 220: pdf.add_page()
            pdf.set_font('Helvetica', 'B', 14)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 10, "STRATEGIC SUGGESTIONS SUMMARY", 0, 1, 'L')
            pdf.ln(3)
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(60, 60, 60)
            for a in recent_audits[:5]: # Top 5 suggestions
                pdf.set_font('Helvetica', 'B', 9)
                pdf.cell(0, 6, f"Feedback for {a['agent_name']} (Audit #{a['id']}):", 0, 1)
                pdf.set_font('Helvetica', '', 9)
                pdf.multi_cell(0, 5, a['suggestions'][:200] + "..." if len(a['suggestions']) > 200 else a['suggestions'])
                pdf.ln(4)

        pdf_output = bytes(pdf.output())
        return Response(content=pdf_output, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=summary_report.pdf"
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        release_db_connection(conn)
