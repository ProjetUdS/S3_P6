package ca.usherbrooke.fgen.api.service;

import ca.usherbrooke.fgen.api.business.Message;
import ca.usherbrooke.fgen.api.mapper.MessageMapper;
import org.apache.ibatis.annotations.Param;
import org.jsoup.parser.Parser;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;


@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessageService {


	@Inject
	MessageMapper messageMapper;


	@GET
	@Path("getmessages/{trimester}/{profile}/{unit}")

	public List<Message> getMessages(
			@PathParam("trimester") String trimesterId,
			@PathParam("profile") String profileId,
			@PathParam("unit") String unit
	) {
		List<Message> messages = messageMapper.select(trimesterId, profileId, unit, null);
		return unescapeEntities(messages);
	}


	@GET
	@Path("getallmessages")
	public List<Message> getAllMessages(
	) {
		List<Message> messages = messageMapper.allMessages();
		return this.unescapeEntities(messages);
	}

	@GET
	@Path("getmessage/{id}")
	public Message getMessage(
			@PathParam("id") Integer id
	) {
		Message message = messageMapper.selectOne(id);
		return unescapeEntities(message);
	}

	@DELETE
	@Path("deletemessage/{id}")
	public void deleteMessage(
			@PathParam("id") Integer id
	) {
		messageMapper.deleteOne(id);
		return;
	}


	@PUT
	@Path("putmessage")
	//@RolesAllowed({Roles.TEACHER})
	public void insertMessage(Message message) {
		messageMapper.insertMessage(message);
	}

	@GET
	@Path("getnewid")
	//@RolesAllowed({Roles.TEACHER})
	public Integer getnewid() {
		Integer id = messageMapper.getNewId();
		return id;
	}

	public static Message unescapeEntities(Message message) {
		message.description = Parser.unescapeEntities(message.description, true);
		return message;
	}

	public List<Message> unescapeEntities(List<Message> messages) {
		return messages
				.stream()
				.map(MessageService::unescapeEntities)
				.collect(Collectors.toList());
	}
}
