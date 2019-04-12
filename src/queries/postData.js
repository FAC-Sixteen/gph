const databaseConnection = require("../database/db_connection.js");

const countFrees = cb => {
  databaseConnection.query(
    "SELECT SUM(CAST(occupied AS INT)) FROM rooms",
    (err, res) => {
      if (err) {
        return cb(err);
      } else {
        cb(null, res);
      }
    }
  );
};

const checkIn = (name, colour, gender, cb) => {
  console.log(`checking in ${name}`);
  databaseConnection.query(
    "INSERT INTO guinea_pigs (guinea_name, guinea_colour, gender, here) VALUES ($1, $2, $3, $4) RETURNING guinea_id",
    [name, colour, gender, "1"],
    (err, res) => {
      if (err) {
        return cb(err);
      } else {
        const guineaPigId = parseInt(res.rows[0]["guinea_id"]);
        console.log(
          "at table guinea_pigs. we have our guinea pig id! ",
          guineaPigId
        );

        newRoom(guineaPigId, cb);
      }
    }
  );
};

const newRoom = (id, cb) => {
  databaseConnection.query(
    "UPDATE rooms SET occupied = '1', guinea_id = $1 WHERE room_num = (SELECT room_num FROM rooms WHERE occupied = '0' LIMIT 1) RETURNING room_num",
    [id],
    (err, res) => {
      if (err) {
        return cb(err);
      } else {
        const assignedRoomNumber = parseInt(res.rows[0]["room_num"]);
        console.log(
          "at table rooms. we have our room number! ",
          assignedRoomNumber
        );
        guineaRoom(assignedRoomNumber, id, cb);
      }
    }
  );
};

const guineaRoom = (roomNum, guineaId, cb) => {
  databaseConnection.query(
    "UPDATE guinea_pigs SET room_num = $1 WHERE guinea_id = $2",
    [roomNum, guineaId],
    (err, res) => {
      if (err) {
        return cb(err);
      } else {
        console.log(
          `giving our guinea pig with id ${guineaId} a room: ${roomNum}`
        );
        cb(null, res);
      }
    }
  );
};

module.exports = {
  checkIn,
  countFrees
};
