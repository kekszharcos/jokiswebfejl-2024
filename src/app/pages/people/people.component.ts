import { Component, OnInit } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { User } from "../../shared/models/User";
import { FriendService } from "../../shared/services/friend.service";
import { Friend } from "../../shared/models/Friend";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrl: './people.component.css',
  standalone: false
})
export class PeopleComponent implements OnInit {
  everyone: User[] = [];
  loggedInUser?: User | null | undefined;
  currentFriends: Array<string> = [];
  itFriends: Array<string> = [];
  friend: Friend = { user: '', friends: [] };
  otherFriend: Friend = { user: '', friends: [] };

  constructor(
    private userService: UserService,
    private friendService: FriendService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(user => {
      if (!user) {
        this.loggedInUser = null;
        return;
      }

      // Map the returned user to your application's User model
      this.loggedInUser = {
        id: user.uid,
        username: user.displayName || user.email || '',
        // Add other properties as needed, e.g. email: user.email, etc.
        ...user
      } as User;

      // Set up friend object for this user
      this.friend.user = user.uid;

      // Fetch all users except self
      this.userService.get().subscribe(users => {
        this.everyone = users.filter(u => u.id !== user.uid);
      });

      // Fetch current user's friends
      this.friendService.getOwnFriends(user.uid).subscribe(friends => {
        this.currentFriends = friends
          .map(f => {
            try {
              return f.friends;
            } catch {
              return [];
            }
          })
          .flat();
      });
    });
  }

  addFriend(friendId: string) {
    if (!this.loggedInUser) return;
    this.itFriends = [];
    if (!this.currentFriends.includes(friendId)) {
      let uns = this.friendService.getOwnFriends(friendId).subscribe(value => {
        if (typeof value[0] === "undefined") {
          this.itFriends = [];
        } else {
          this.itFriends = value[0].friends;
        }

        this.otherFriend.user = friendId;
        this.itFriends.push(this.loggedInUser!.id);
        this.otherFriend.friends = this.itFriends;
        this.friendService.create(this.otherFriend).subscribe({
          error: (reason) => {
            // handle error if needed
          }
        });

        this.currentFriends.push(friendId);
        this.friend.friends = this.currentFriends;
        this.friendService.create(this.friend).subscribe({
          next: () => {
            // After both friend records are created, refresh the friends list
            this.friendService.getOwnFriends(this.loggedInUser!.id).subscribe(friends => {
              this.currentFriends = friends
                .map(f => {
                  try {
                    return f.friends;
                  } catch {
                    return [];
                  }
                })
                .flat();
            });
          },
          error: (reason) => {
            // handle error if needed
          }
        });

        uns.unsubscribe();
      });
    }
  }
}
