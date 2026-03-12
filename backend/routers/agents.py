from fastapi import APIRouter, Depends
from auth_utils import get_current_user
from psycopg2.extras import RealDictCursor
from database import get_db_connection, release_db_connection

router = APIRouter(prefix="/api/agents", tags=["Agents"], dependencies=[Depends(get_current_user)])

@router.get("")
def get_agents():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM agents")
        agents = cur.fetchall()
        cur.close()
        return agents
    finally:
        release_db_connection(conn)

@router.get("/{agent_id}/analytics")
def get_agent_analytics(agent_id: int):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get agent's personal trend
        trend_query = """
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM-DD') as date,
            AVG(overall_score) as avg_score,
            AVG(empathy_score) as avg_empathy,
            AVG(resolution_score) as avg_resolution,
            AVG(compliance_score) as avg_compliance
          FROM audits
          WHERE agent_id = %s
          GROUP BY date
          ORDER BY date ASC
          LIMIT 30
        """
        cur.execute(trend_query, (agent_id,))
        trend = cur.fetchall()
        
        # Get agent's recent audits
        recent_query = """
          SELECT id, overall_score, created_at, type
          FROM audits
          WHERE agent_id = %s
          ORDER BY created_at DESC
          LIMIT 5
        """
        cur.execute(recent_query, (agent_id,))
        recent = cur.fetchall()
        
        cur.close()
        
        return {
            "trend": trend,
            "recent_audits": recent
        }
    finally:
        release_db_connection(conn)
