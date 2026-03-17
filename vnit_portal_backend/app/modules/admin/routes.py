@routes.get("/admin/dashboard")
def dashboard(user=Depends(require_role("admin))):
	return {"msg": "admin only"}
