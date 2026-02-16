import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.core.config import settings

class ReportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.header_style = ParagraphStyle(
            'HeaderStyle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=12,
            alignment=1
        )
        self.sub_header_style = ParagraphStyle(
            'SubHeaderStyle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=10,
            textColor=colors.HexColor("#2E5B88")
        )

    def generate_quiz_report(self, session_data: dict, questions: list, responses: list, proctor_logs: list) -> str:
        report_filename = f"Report_{session_data['id']}.pdf"
        report_path = settings.UPLOAD_DIR / report_filename
        doc = SimpleDocTemplate(str(report_path), pagesize=letter)
        elements = []

        elements.append(Paragraph(f"Performance Report: {session_data.get('test_name', 'AI Quiz')}", self.header_style))
        elements.append(Spacer(1, 12))

        summary_data = [
            ["Session ID", session_data['id']],
            ["Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
            ["Total Score", f"{session_data['total_score']} / {session_data['max_score']}"],
            ["Accuracy", f"{session_data['accuracy']}%"],
            ["Status", session_data['status']]
        ]
        
        summary_table = Table(summary_data, colWidths=[150, 300])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 6)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Proctoring Log Summary", self.sub_header_style))
        if proctor_logs:
            p_data = [["Timestamp", "Violation Type"]]
            for log in proctor_logs:
                p_data.append([log.timestamp.strftime("%H:%M:%S"), log.violation_type])
            p_table = Table(p_data, colWidths=[150, 300])
            p_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.red)
            ]))
            elements.append(p_table)
        else:
            elements.append(Paragraph("No proctoring violations recorded. Integrity maintained.", self.styles['Normal']))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Detailed Question Analysis", self.sub_header_style))
        
        response_map = {r.question_id: r for r in responses}

        for idx, q in enumerate(questions, 1):
            resp = response_map.get(q.id)
            status_text = "Correct" if resp and resp.is_correct else "Incorrect"
            status_color = colors.green if resp and resp.is_correct else colors.red
            
            elements.append(Paragraph(f"Q{idx}. {q.question_text} ({q.difficulty.upper()})", self.styles['Heading3']))
            
            opts_text = ", ".join([f"{k}: {v}" for k, v in q.options.items()])
            elements.append(Paragraph(f"<b>Options:</b> {opts_text}", self.styles['Normal']))
            
            user_ans = resp.selected_answer if resp else "No Response"
            elements.append(Paragraph(f"<b>Your Answer:</b> {user_ans} (<font color='{status_color}'>{status_text}</font>)", self.styles['Normal']))
            elements.append(Paragraph(f"<b>Correct Answer:</b> {q.correct_answer}", self.styles['Normal']))
            elements.append(Paragraph(f"<b>Explanation:</b> {q.explanation}", self.styles['Normal']))
            
            if q.reference_context:
                elements.append(Paragraph(f"<i>Reference: {q.reference_context}</i>", self.styles['Italic']))
            
            elements.append(Spacer(1, 12))

        doc.build(elements)
        return str(report_path)

report_service = ReportService()