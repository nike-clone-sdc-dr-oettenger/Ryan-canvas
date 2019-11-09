from locust import HttpLocust, TaskSet

# def login(l):
#     l.client.post("/login", {"username":"ellen_key", "password":"education"})

# def logout(l):
#     l.client.post("/logout", {"username":"ellen_key", "password":"education"})

def index(l):
    l.client.post("api/images", {"shoe_id": 999, "img1": "fakeurl.com"})

def GetImages(l):
    l.client.get("api/images?shoe_id=0")

class UserBehavior(TaskSet):
    tasks = {GetImages: 1}

    # def on_start(self):
    #     login(self)

    # def on_stop(self):
    #     logout(self)

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 50
    max_wait = 100