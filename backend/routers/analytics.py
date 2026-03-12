from fastapi import APIRouter, Depends
from auth_utils import get_current_user
from psycopg2.extras import RealDictCursor
from database import get_db_connection, release_db_connection

router = APIRouter(prefix="/api/analytics", tags=["Analytics"], dependencies=[Depends(get_current_user)])

@router.get("")
def get_analytics():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        stats_query = """
          SELECT 
            ag.id as agent_id,
            ag.name as agent_name,
            AVG(a.overall_score) as avg_score,
            AVG(a.empathy_score) as avg_empathy,
            AVG(a.resolution_score) as avg_resolution,
            AVG(a.compliance_score) as avg_compliance,
            COUNT(a.id) as total_audits
          FROM agents ag
          LEFT JOIN audits a ON ag.id = a.agent_id
          GROUP BY ag.id, ag.name
        """
        cur.execute(stats_query)
        stats = cur.fetchall()
        
        trend_query = """
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM-DD') as date,
            AVG(overall_score) as avg_score,
            AVG(empathy_score) as avg_empathy,
            AVG(resolution_score) as avg_resolution,
            AVG(compliance_score) as avg_compliance
          FROM audits
          GROUP BY date
          ORDER BY date ASC
          LIMIT 30
        """
        cur.execute(trend_query)
        trend = cur.fetchall()
        
        cur.close()
        
        return {
            "stats": stats,
            "trend": trend
        }
    finally:
        release_db_connection(conn)
