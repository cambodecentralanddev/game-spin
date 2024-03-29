import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { doc, getDoc, getDocs, setDoc, updateDoc } from '@firebase/firestore'
import { usersCol } from "../database/useDb"; 

export class MyRoom extends Room<MyRoomState> {

  onCreate (options: any) {
    this.setState(new MyRoomState());
    
    this.onMessage("request_spin", async(client, message) => {
        let result = this.getRandomInt(7);
        client.send("respond_spin",result);
        this.broadcast("respond_broadcast_spin",result);

        console.log(message);

        let address = message;
        let totalScore = 0;
        const singleUserDocRef = doc(usersCol, address)

        const singleUserDoc = await getDoc(singleUserDocRef)
        const singleUser = singleUserDoc.data()

        if (singleUser) {
          console.log(singleUser.userId)
          totalScore = singleUser.score + result;
          client.send("respond_total_score",totalScore);
          await updateDoc(singleUserDocRef, {
            score : totalScore
          })
        }  
        else{
          await setDoc(singleUserDocRef, {
            userId : address,
            name:address,
            score:0
          })
        }

    });

    this.onMessage("pull_score", async(client, message) => {
      let address = message;
      let totalScore = 0;
      const singleUserDocRef = doc(usersCol, address)

      const singleUserDoc = await getDoc(singleUserDocRef)
      const singleUser = singleUserDoc.data()

      if (singleUser) {
        console.log(singleUser.userId)
        totalScore = singleUser.score ;
        client.send("respond_total_score",totalScore);
      }  
      else{
        await setDoc(singleUserDocRef, {
          userId : address,
          name:address,
          score:0
        })
      }
  });

  }

  getRandomInt(max:number) {
    return Math.floor(Math.random() * max);
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
