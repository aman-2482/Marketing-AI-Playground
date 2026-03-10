import secrets

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app.config import settings
from app.models import Activity, PromptHistory


class AdminAuthBackend(AuthenticationBackend):
    """Username/password authentication for the SQLAdmin panel."""

    def __init__(self, secret_key: str, username: str, password: str) -> None:
        super().__init__(secret_key=secret_key)
        self._username = username
        self._password = password

    async def login(self, request: Request) -> bool:
        form = await request.form()
        # Constant-time comparison prevents timing-based username/password enumeration
        user_ok = secrets.compare_digest(str(form.get("username", "")), self._username)
        pass_ok = secrets.compare_digest(str(form.get("password", "")), self._password)
        if user_ok and pass_ok:
            request.session["admin_authenticated"] = True
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool | RedirectResponse:
        if not request.session.get("admin_authenticated", False):
            return RedirectResponse(url="/admin/login", status_code=302)
        return True


class ActivityAdmin(ModelView, model=Activity):
    column_list = [Activity.id, Activity.name, Activity.slug, Activity.category, Activity.order, Activity.is_active]
    column_searchable_list = [Activity.name, Activity.slug]
    column_sortable_list = [Activity.id, Activity.name, Activity.order]
    form_excluded_columns = [Activity.created_at]


class PromptHistoryAdmin(ModelView, model=PromptHistory):
    column_list = [
        PromptHistory.id,
        PromptHistory.session_id,
        PromptHistory.activity_slug,
        PromptHistory.prompt,
        PromptHistory.is_favorite,
        PromptHistory.created_at,
    ]
    column_searchable_list = [PromptHistory.prompt, PromptHistory.session_id]
    column_sortable_list = [PromptHistory.id, PromptHistory.created_at]
    column_default_sort = (PromptHistory.created_at, True)


def setup_admin(app, engine) -> Admin:
    """Mount the SQLAdmin panel at /admin/ on the given FastAPI app."""
    auth_backend = AdminAuthBackend(
        secret_key=settings.secret_key,
        username=settings.admin_username,
        password=settings.admin_password,
    )
    admin = Admin(
        app,
        engine,
        title="GenAI Marketing Lab Admin",
        authentication_backend=auth_backend,
    )
    admin.add_view(ActivityAdmin)
    admin.add_view(PromptHistoryAdmin)
    return admin
