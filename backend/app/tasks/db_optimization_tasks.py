from celery import Celery
from app.core.db_optimization import run_optimization, run_maintenance
from app.core.database_indexes import refresh_materialized_views
from app.core.database import SessionLocal
import logging

logger = logging.getLogger(__name__)

# Initialize Celery (this would be configured in your main Celery app)
celery_app = Celery('rest_empire')

@celery_app.task(name="optimize_database")
def optimize_database_task():
    """Celery task for full database optimization"""
    try:
        logger.info("Starting database optimization task...")
        results = run_optimization()
        logger.info(f"Database optimization completed: {results}")
        return results
    except Exception as e:
        logger.error(f"Database optimization task failed: {str(e)}")
        raise

@celery_app.task(name="refresh_materialized_views")
def refresh_materialized_views_task():
    """Celery task to refresh materialized views"""
    try:
        logger.info("Starting materialized views refresh...")
        db = SessionLocal()
        try:
            refresh_materialized_views(db)
            logger.info("Materialized views refreshed successfully")
            return {"status": "completed"}
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Materialized views refresh failed: {str(e)}")
        raise

@celery_app.task(name="database_maintenance")
def database_maintenance_task():
    """Celery task for regular database maintenance"""
    try:
        logger.info("Starting database maintenance task...")
        results = run_maintenance()
        logger.info(f"Database maintenance completed: {results}")
        return results
    except Exception as e:
        logger.error(f"Database maintenance task failed: {str(e)}")
        raise

# Schedule tasks (configure in your Celery beat schedule)
celery_app.conf.beat_schedule = {
    'refresh-materialized-views': {
        'task': 'refresh_materialized_views',
        'schedule': 300.0,  # Every 5 minutes
    },
    'database-maintenance': {
        'task': 'database_maintenance',
        'schedule': 3600.0,  # Every hour
    },
    'full-optimization': {
        'task': 'optimize_database',
        'schedule': 86400.0,  # Daily
    },
}
